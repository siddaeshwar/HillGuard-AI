const express = require("express");

const router = express.Router();

const {
    getWeather,
    getAllLocationsWeather
} = require("../controllers/weatherController");


// Single location weather
router.get("/", getWeather);


// All PostgreSQL locations weather
router.get("/all", getAllLocationsWeather);


module.exports = router;