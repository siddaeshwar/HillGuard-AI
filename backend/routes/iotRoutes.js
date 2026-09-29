const express = require("express");

const router = express.Router();

const {
    addSensorData,
    getSensorData
} = require("../controllers/iotController");


// POST - Add sensor data
router.post("/sensor-data", addSensorData);


// GET - Get sensor data
router.get("/sensor-data", getSensorData);


module.exports = router;