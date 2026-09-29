const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const locationRoutes = require("./routes/locationRoutes");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const soilMoistureRoutes = require("./routes/soilMoistureRoutes");
const historicalRainfallRoutes =
    require("./routes/historicalRainfallRoutes");
const iotRoutes = require("./routes/iotRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use(
    "/api/soil-moisture",
    soilMoistureRoutes
);
app.use(
    "/api/historical-rainfall",
    historicalRainfallRoutes
);
app.use("/api/iot", iotRoutes);


app.get("/", (req, res) => {
    res.json({
        project: "HILLGUARD AI",
        message: "Flash Flood Prediction System API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "success",
            database: "connected",
            serverTime: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            database: "connection failed",
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`HILLGUARD AI server running on http://localhost:${PORT}`);
});