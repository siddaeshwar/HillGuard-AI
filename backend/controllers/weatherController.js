const pool = require("../config/db");


// =====================================================
// 1. GET WEATHER FOR A SINGLE LOCATION
// =====================================================

const getWeather = async (req, res) => {
    try {

        const { latitude, longitude } = req.query;

        // Validate coordinates
        if (!latitude || !longitude) {

            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });

        }

        // Open-Meteo API URL
        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&hourly=rain,precipitation,precipitation_probability` +
            `&forecast_days=2` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Weather API returned ${response.status}`
            );

        }

        const data = await response.json();

        // Send weather response
        res.json({

            success: true,

            location: {
                latitude: Number(latitude),
                longitude: Number(longitude)
            },

            timezone: data.timezone,

            hourly: {

                time: data.hourly.time,

                rain: data.hourly.rain,

                precipitation:
                    data.hourly.precipitation,

                precipitation_probability:
                    data.hourly.precipitation_probability

            }

        });

    } catch (error) {

        console.error(
            "Weather API error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch weather data",

            error: error.message

        });

    }
};


// =====================================================
// 2. GET WEATHER FOR ALL MONITORED LOCATIONS
// =====================================================

const getAllLocationsWeather = async (req, res) => {

    try {

        // Get all locations from PostgreSQL
        const result = await pool.query(`
            SELECT
                location_id,
                name,
                district,
                state,
                latitude,
                longitude
            FROM locations
            ORDER BY location_id
        `);

        const locations = result.rows;


        // Check locations
        if (locations.length === 0) {

            return res.status(404).json({

                success: false,

                message: "No monitored locations found"

            });

        }


        // Fetch weather for every location
        const weatherData = await Promise.all(

            locations.map(async (location) => {

                try {

                    // Open-Meteo API
                    const url =
                        `https://api.open-meteo.com/v1/forecast` +
                        `?latitude=${location.latitude}` +
                        `&longitude=${location.longitude}` +
                        `&hourly=rain,precipitation,precipitation_probability` +
                        `&forecast_days=2` +
                        `&timezone=auto`;

                    const response = await fetch(url);


                    if (!response.ok) {

                        throw new Error(
                            `Weather API returned ${response.status}`
                        );

                    }


                    const data = await response.json();


                    // Return weather information
                    return {

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

                        timezone:
                            data.timezone,

                        rainfall:
                            data.hourly.rain?.[0] ?? 0,

                        precipitation:
                            data.hourly.precipitation?.[0] ?? 0,

                        precipitation_probability:
                            data.hourly
                                .precipitation_probability?.[0] ?? 0

                    };

                } catch (error) {

                    // If weather fails for one location
                    console.error(
                        `Weather error for ${location.name}:`,
                        error.message
                    );


                    return {

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

                        rainfall: null,

                        precipitation: null,

                        precipitation_probability:
                            null,

                        error:
                            "Weather data unavailable"

                    };

                }

            })

        );


        // Send all locations weather
        res.json({

            success: true,

            count:
                weatherData.length,

            locations:
                weatherData

        });


    } catch (error) {

        console.error(
            "All locations weather error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch weather data",

            error:
                error.message

        });

    }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {

    getWeather,

    getAllLocationsWeather

};