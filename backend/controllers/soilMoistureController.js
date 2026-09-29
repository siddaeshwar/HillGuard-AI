const pool = require("../config/db");


// =====================================================
// GET SOIL MOISTURE FOR ALL LOCATIONS
// =====================================================

const getAllSoilMoisture = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                sm.soil_moisture_id,
                sm.location_id,
                l.name,
                l.district,
                l.state,
                l.latitude,
                l.longitude,
                sm.moisture_percent,
                sm.sensor_status,
                sm.recorded_at
            FROM soil_moisture sm
            JOIN locations l
                ON sm.location_id = l.location_id
            ORDER BY sm.location_id
        `);


        const locations = result.rows;


        if (locations.length === 0) {

            return res.status(404).json({

                success: false,

                message: "No soil moisture data found"

            });

        }


        // Add moisture level
        const moistureData = locations.map((location) => {

            const moisture =
                Number(location.moisture_percent);

            let moistureLevel;


            if (moisture <= 30) {

                moistureLevel = "LOW";

            } else if (moisture <= 60) {

                moistureLevel = "MODERATE";

            } else if (moisture <= 80) {

                moistureLevel = "HIGH";

            } else {

                moistureLevel = "VERY HIGH";

            }


            return {

                soil_moisture_id:
                    location.soil_moisture_id,

                location_id:
                    location.location_id,

                name:
                    location.name,

                district:
                    location.district,

                state:
                    location.state,

                latitude:
                    Number(location.latitude),

                longitude:
                    Number(location.longitude),

                moisture_percent:
                    moisture,

                moisture_level:
                    moistureLevel,

                sensor_status:
                    location.sensor_status,

                recorded_at:
                    location.recorded_at

            };

        });


        res.json({

            success: true,

            count:
                moistureData.length,

            locations:
                moistureData

        });


    } catch (error) {

        console.error(
            "Soil moisture error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch soil moisture data",

            error:
                error.message

        });

    }

};


module.exports = {

    getAllSoilMoisture

};