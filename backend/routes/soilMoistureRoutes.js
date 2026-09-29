const express = require("express");

const router = express.Router();

const {
    getAllSoilMoisture
} = require("../controllers/soilMoistureController");


// Get soil moisture for all locations
router.get("/", getAllSoilMoisture);


module.exports = router;