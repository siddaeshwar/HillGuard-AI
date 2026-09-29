const pool = require("../config/db");


// =====================================================
// GET HISTORICAL RAINFALL
// Existing API
// GET /api/historical-rainfall
// =====================================================

const getHistoricalRainfall = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                rainfall_id,
                station,
                agency,
                state,
                district,
                tehsil,
                block,
                village,
                river,
                basin,
                latitude,
                longitude,
                recorded_at,
                rainfall_mm
            FROM historical_rainfall
            ORDER BY recorded_at DESC
            LIMIT 500
        `);


        res.json({
            success: true,
            count: result.rows.length,
            locations: result.rows
        });

    } catch (error) {

        console.error(
            "Historical rainfall error:",
            error
        );


        res.status(500).json({
            success: false,
            message:
                "Failed to fetch historical rainfall data",
            error: error.message
        });

    }
};


// =====================================================
// HAVERSINE DISTANCE
// Calculates distance between two coordinates
// Returns distance in kilometres
// =====================================================

function calculateDistanceKm(
    latitude1,
    longitude1,
    latitude2,
    longitude2
) {

    const earthRadiusKm = 6371;


    const lat1 =
        Number(latitude1) *
        Math.PI /
        180;

    const lat2 =
        Number(latitude2) *
        Math.PI /
        180;


    const deltaLat =
        (
            Number(latitude2) -
            Number(latitude1)
        ) *
        Math.PI /
        180;


    const deltaLon =
        (
            Number(longitude2) -
            Number(longitude1)
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(deltaLat / 2) *
        Math.sin(deltaLat / 2) +

        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadiusKm * c;
}


// =====================================================
// FIND NEAREST CWC STATION
//
// GET
// /api/historical-rainfall/nearest
// ?latitude=11.0168&longitude=76.9558
// =====================================================

const getNearestCwcStation = async (req, res) => {

    try {

        const latitude =
            Number(req.query.latitude);

        const longitude =
            Number(req.query.longitude);


        // ---------------------------------------------
        // Validate coordinates
        // ---------------------------------------------

        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid latitude and longitude are required"

            });

        }


        // ---------------------------------------------
        // Get station coordinates
        //
        // DISTINCT station + coordinates
        // ---------------------------------------------

        const stationResult =
            await pool.query(`
                SELECT DISTINCT
                    station,
                    agency,
                    state,
                    district,
                    tehsil,
                    block,
                    village,
                    latitude,
                    longitude
                FROM historical_rainfall
                WHERE
                    latitude IS NOT NULL
                    AND longitude IS NOT NULL
                    AND station IS NOT NULL
            `);


        if (
            stationResult.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "No CWC rainfall stations found"

            });

        }


        // ---------------------------------------------
        // Find nearest station
        // ---------------------------------------------

        let nearestStation = null;

        let nearestDistance = Infinity;


        for (
            const station
            of stationResult.rows
        ) {

            const stationLatitude =
                Number(station.latitude);

            const stationLongitude =
                Number(station.longitude);


            if (
                Number.isNaN(
                    stationLatitude
                ) ||
                Number.isNaN(
                    stationLongitude
                )
            ) {

                continue;

            }


            const distance =
                calculateDistanceKm(
                    latitude,
                    longitude,
                    stationLatitude,
                    stationLongitude
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearestStation =
                    station;

            }

        }


        if (!nearestStation) {

            return res.status(404).json({

                success: false,

                message:
                    "Could not find a valid CWC station"

            });

        }


        // ---------------------------------------------
        // Get all historical records
        // belonging to nearest station
        // ---------------------------------------------

        const recordsResult =
            await pool.query(
                `
                SELECT
                    rainfall_id,
                    station,
                    agency,
                    state,
                    district,
                    tehsil,
                    block,
                    village,
                    river,
                    basin,
                    latitude,
                    longitude,
                    recorded_at,
                    rainfall_mm
                FROM historical_rainfall
                WHERE
                    station = $1
                    AND latitude = $2
                    AND longitude = $3
                ORDER BY recorded_at DESC
                `,
                [
                    nearestStation.station,
                    nearestStation.latitude,
                    nearestStation.longitude
                ]
            );


        // ---------------------------------------------
        // Calculate maximum rainfall
        // ---------------------------------------------

        const rainfallValues =
            recordsResult.rows
                .map(
                    (record) =>
                        Number(
                            record.rainfall_mm
                        )
                )
                .filter(
                    (value) =>
                        !Number.isNaN(value)
                );


        const maximumRainfall =
            rainfallValues.length > 0
                ? Math.max(
                    ...rainfallValues
                )
                : null;


        // ---------------------------------------------
        // Response
        // ---------------------------------------------

        res.json({

            success: true,

            monitored_location: {

                latitude,
                longitude

            },

            nearest_station: {

                station:
                    nearestStation.station,

                agency:
                    nearestStation.agency,

                state:
                    nearestStation.state,

                district:
                    nearestStation.district,

                tehsil:
                    nearestStation.tehsil,

                block:
                    nearestStation.block,

                village:
                    nearestStation.village,

                latitude:
                    Number(
                        nearestStation.latitude
                    ),

                longitude:
                    Number(
                        nearestStation.longitude
                    ),

                distance_km:
                    Number(
                        nearestDistance.toFixed(2)
                    )

            },

            summary: {

                record_count:
                    recordsResult.rows.length,

                maximum_rainfall_mm:
                    maximumRainfall

            },

            records:
                recordsResult.rows

        });

    } catch (error) {

        console.error(
            "Nearest CWC station error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to find nearest CWC station",

            error:
                error.message

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getHistoricalRainfall,

    getNearestCwcStation

};