const pool = require("../config/db");

// POST - Receive IoT sensor data
const addSensorData = async (req, res) => {
    try {
        const {
            sensor_id,
            location_id,
            rainfall_mm,
            soil_moisture_percent,
            water_level_m,
            sensor_status
        } = req.body;

        if (!sensor_id || !location_id) {
            return res.status(400).json({
                success: false,
                message: "sensor_id and location_id are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO iot_sensor_data
            (
                sensor_id,
                location_id,
                rainfall_mm,
                soil_moisture_percent,
                water_level_m,
                sensor_status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                sensor_id,
                location_id,
                rainfall_mm,
                soil_moisture_percent,
                water_level_m,
                sensor_status || "ONLINE"
            ]
        );

        res.status(201).json({
            success: true,
            message: "IoT sensor data added successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("IoT sensor data error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add IoT sensor data",
            error: error.message
        });
    }
};


// GET - Fetch latest IoT sensor data
const getSensorData = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                i.sensor_data_id,
                i.sensor_id,
                i.location_id,
                l.name,
                l.district,
                l.state,
                l.latitude,
                l.longitude,
                i.rainfall_mm,
                i.soil_moisture_percent,
                i.water_level_m,
                i.sensor_status,
                i.recorded_at
            FROM iot_sensor_data i
            JOIN locations l
                ON i.location_id = l.location_id
            ORDER BY i.recorded_at DESC
            LIMIT 100
            `
        );

        res.json({
            success: true,
            count: result.rows.length,
            sensors: result.rows
        });

    } catch (error) {
        console.error("IoT sensor fetch error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch IoT sensor data",
            error: error.message
        });
    }
};

module.exports = {
    addSensorData,
    getSensorData
};