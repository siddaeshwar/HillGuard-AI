const express = require("express");

const router =
    express.Router();


const {
    getHistoricalRainfall,
    getNearestCwcStation
} =
    require(
        "../controllers/historicalRainfallController"
    );


// =====================================================
// ALL HISTORICAL RAINFALL
// =====================================================

router.get(
    "/",
    getHistoricalRainfall
);


// =====================================================
// NEAREST CWC STATION
// =====================================================

router.get(
    "/nearest",
    getNearestCwcStation
);


module.exports = router;