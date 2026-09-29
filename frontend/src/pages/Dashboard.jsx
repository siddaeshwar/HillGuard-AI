import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import MapView from "../components/MapView";

// =====================================================
// PHASE 4.3 - TERRAIN / SLOPE CLASSIFICATION
// =====================================================

function getTerrainRisk(slope) {
    const value = Number(slope) || 0;

    if (value >= 35) {
        return "VERY STEEP";
    }

    if (value >= 25) {
        return "STEEP";
    }

    if (value >= 15) {
        return "MODERATE";
    }

    return "GENTLE";
}


// =====================================================
// PHASE 4.2.5 - COMBINED RISK CALCULATION
// =====================================================

function getCombinedRisk(
    location,
    weatherData,
    soilMoistureData
) {
    const slope = Number(location.slope) || 0;

    const weather = weatherData.find(
        (item) =>
            Number(item.location_id) ===
            Number(location.location_id)
    );

    const soil = soilMoistureData.find(
        (item) =>
            Number(item.location_id) ===
            Number(location.location_id)
    );


    // =================================================
    // SLOPE SCORE - MAX 40
    // =================================================

    const slopeScore =
        slope >= 35
            ? 40
            : slope >= 25
            ? 30
            : slope >= 15
            ? 20
            : 10;


    // =================================================
    // RAINFALL SCORE - MAX 30
    // =================================================

    const rainfall =
        Number(weather?.rainfall) || 0;

    const rainfallScore =
        rainfall >= 50
            ? 30
            : rainfall >= 25
            ? 20
            : rainfall >= 10
            ? 10
            : 0;


    // =================================================
    // SOIL MOISTURE SCORE - MAX 30
    // =================================================

    const moisture =
        Number(soil?.moisture_percent) || 0;

    const moistureScore =
        moisture >= 80
            ? 30
            : moisture >= 60
            ? 20
            : moisture >= 30
            ? 10
            : 0;


    // =================================================
    // TOTAL SCORE - MAX 100
    // =================================================

    const totalScore =
        slopeScore +
        rainfallScore +
        moistureScore;


    // =================================================
    // RISK LEVEL
    // =================================================

    if (totalScore >= 75) {
        return "CRITICAL";
    }

    if (totalScore >= 50) {
        return "HIGH";
    }

    if (totalScore >= 25) {
        return "MEDIUM";
    }

    return "LOW";
}


// =====================================================
// PHASE 4.2.5 - RISK SCORE
// =====================================================

function getRiskScore(
    location,
    weatherData,
    soilMoistureData
) {
    const slope = Number(location.slope) || 0;

    const weather = weatherData.find(
        (item) =>
            Number(item.location_id) ===
            Number(location.location_id)
    );

    const soil = soilMoistureData.find(
        (item) =>
            Number(item.location_id) ===
            Number(location.location_id)
    );


    // =================================================
    // SLOPE SCORE - MAX 40
    // =================================================

    const slopeScore =
        slope >= 35
            ? 40
            : slope >= 25
            ? 30
            : slope >= 15
            ? 20
            : 10;


    // =================================================
    // RAINFALL SCORE - MAX 30
    // =================================================

    const rainfall =
        Number(weather?.rainfall) || 0;

    const rainfallScore =
        rainfall >= 50
            ? 30
            : rainfall >= 25
            ? 20
            : rainfall >= 10
            ? 10
            : 0;


    // =================================================
    // SOIL MOISTURE SCORE - MAX 30
    // =================================================

    const moisture =
        Number(soil?.moisture_percent) || 0;

    const moistureScore =
        moisture >= 80
            ? 30
            : moisture >= 60
            ? 20
            : moisture >= 30
            ? 10
            : 0;


    return (
        slopeScore +
        rainfallScore +
        moistureScore
    );
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {

    // =================================================
    // LOCATION STATE
    // =================================================

    const [locations, setLocations] = useState([]);

    const [weatherData, setWeatherData] = useState([]);
    const [weatherLoading, setWeatherLoading] =
        useState(true);

    const [soilMoistureData, setSoilMoistureData] =
        useState([]);

    const [soilMoistureLoading, setSoilMoistureLoading] =
        useState(true);

    const [historicalRainfall, setHistoricalRainfall] =
        useState([]);

    const [historicalRainfallLoading, setHistoricalRainfallLoading] =
        useState(true);


    // =================================================
    // PHASE 4.5.3 - IoT SENSOR STATE
    // =================================================

    const [iotSensorData, setIotSensorData] =
        useState([]);

    const [iotSensorLoading, setIotSensorLoading] =
        useState(true);


    // =================================================
    // FILTER STATE
    // =================================================

    const [stateFilter, setStateFilter] =
        useState("ALL");

    const [riskFilter, setRiskFilter] =
        useState("ALL");


    // =================================================
    // FETCH ALL DATA
    // =================================================

    useEffect(() => {

        // ---------------------------------------------
        // Fetch monitored locations
        // ---------------------------------------------

        fetch(
            "http://localhost:5000/api/locations"
        )
            .then((response) =>
                response.json()
            )
            .then((data) => {

                setLocations(data);

            })
            .catch((error) => {

                console.error(
                    "Location fetch error:",
                    error
                );

            });


        // ---------------------------------------------
        // Fetch weather
        // ---------------------------------------------

        fetch(
            "http://localhost:5000/api/weather/all"
        )
            .then((response) =>
                response.json()
            )
            .then((data) => {

                if (data.success) {

                    setWeatherData(
                        data.locations
                    );

                }

                setWeatherLoading(false);

            })
            .catch((error) => {

                console.error(
                    "Weather fetch error:",
                    error
                );

                setWeatherLoading(false);

            });


        // ---------------------------------------------
        // PHASE 4.2
        // Fetch soil moisture
        // ---------------------------------------------

        fetch(
            "http://localhost:5000/api/soil-moisture"
        )
            .then((response) =>
                response.json()
            )
            .then((data) => {

                if (data.success) {

                    setSoilMoistureData(
                        data.locations
                    );

                }

                setSoilMoistureLoading(false);

            })
            .catch((error) => {

                console.error(
                    "Soil moisture fetch error:",
                    error
                );

                setSoilMoistureLoading(false);

            });


        // ---------------------------------------------
        // PHASE 4.4A
        // Fetch historical rainfall
        // ---------------------------------------------

        fetch(
            "http://localhost:5000/api/historical-rainfall"
        )
            .then((response) =>
                response.json()
            )
            .then((data) => {

                if (data.success) {

                    setHistoricalRainfall(
                        data.locations
                    );

                }

                setHistoricalRainfallLoading(false);

            })
            .catch((error) => {

                console.error(
                    "Historical rainfall fetch error:",
                    error
                );

                setHistoricalRainfallLoading(false);

            });


        // ---------------------------------------------
        // PHASE 4.5.3
        // Fetch IoT sensor data
        // ---------------------------------------------

        fetch(
            "http://localhost:5000/api/iot/sensor-data"
        )
            .then((response) =>
                response.json()
            )
            .then((data) => {

                if (data.success) {

                    setIotSensorData(
                        data.sensors
                    );

                }

                setIotSensorLoading(false);

            })
            .catch((error) => {

                console.error(
                    "IoT sensor fetch error:",
                    error
                );

                setIotSensorLoading(false);

            });

    }, []);


    // =================================================
    // FIND WEATHER FOR LOCATION
    // =================================================

    const getWeatherForLocation = (
        locationId
    ) => {

        return weatherData.find(
            (weather) =>
                Number(
                    weather.location_id
                ) === Number(locationId)
        );

    };


    // =================================================
    // FIND SOIL MOISTURE FOR LOCATION
    // =================================================

    const getSoilMoistureForLocation = (
        locationId
    ) => {

        return soilMoistureData.find(
            (soil) =>
                Number(
                    soil.location_id
                ) === Number(locationId)
        );

    };


    // =================================================
    // PHASE 4.5.3
    // FIND IoT SENSOR FOR LOCATION
    // =================================================

    const getIoTSensorForLocation = (
        locationId
    ) => {

        return iotSensorData.find(
            (sensor) =>
                Number(
                    sensor.location_id
                ) === Number(locationId)
        );

    };


    // =================================================
    // PHASE 4.4A
    // FIND NEARBY HISTORICAL RAINFALL
    // =================================================

    const getHistoricalRainfallForLocation = (
        location
    ) => {

        if (
            !location ||
            historicalRainfall.length === 0
        ) {
            return [];
        }


        const latitude =
            Number(location.latitude);

        const longitude =
            Number(location.longitude);


        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {
            return [];
        }


        return historicalRainfall.filter(
            (record) => {

                const recordLatitude =
                    Number(record.latitude);

                const recordLongitude =
                    Number(record.longitude);


                if (
                    Number.isNaN(
                        recordLatitude
                    ) ||
                    Number.isNaN(
                        recordLongitude
                    )
                ) {
                    return false;
                }


                return (
                    Math.abs(
                        recordLatitude -
                        latitude
                    ) < 0.1 &&

                    Math.abs(
                        recordLongitude -
                        longitude
                    ) < 0.1
                );

            }
        );

    };


    // =================================================
    // GET AVAILABLE STATES
    // =================================================

    const states = useMemo(() => {

        const uniqueStates = [
            ...new Set(
                locations
                    .map(
                        (location) =>
                            location.state
                    )
                    .filter(Boolean)
            )
        ];

        return uniqueStates.sort();

    }, [locations]);


    // =================================================
    // APPLY FILTERS
    // =================================================

    const filteredLocations = useMemo(() => {

        return locations.filter(
            (location) => {

                const riskLevel =
                    getCombinedRisk(
                        location,
                        weatherData,
                        soilMoistureData
                    );


                const stateMatch =
                    stateFilter === "ALL" ||
                    location.state ===
                    stateFilter;


                const riskMatch =
                    riskFilter === "ALL" ||
                    riskLevel ===
                    riskFilter;


                return (
                    stateMatch &&
                    riskMatch
                );

            }
        );

    }, [
        locations,
        weatherData,
        soilMoistureData,
        stateFilter,
        riskFilter
    ]);


    // =================================================
    // DYNAMIC RISK COUNTS
    // =================================================

    const riskCounts = useMemo(() => {

        const counts = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            CRITICAL: 0
        };


        locations.forEach(
            (location) => {

                const riskLevel =
                    getCombinedRisk(
                        location,
                        weatherData,
                        soilMoistureData
                    );


                counts[riskLevel]++;

            }
        );


        return counts;

    }, [
        locations,
        weatherData,
        soilMoistureData
    ]);


    // =================================================
    // PHASE 4.5.3
    // IoT ONLINE SENSOR COUNT
    // =================================================

    const onlineIoTSensors = useMemo(() => {

        return iotSensorData.filter(
            (sensor) =>
                String(
                    sensor.sensor_status
                ).toUpperCase() ===
                "ONLINE"
        ).length;

    }, [iotSensorData]);


    // =================================================
    // PHASE 4.4B.2
    // HISTORICAL FLOOD DATA
    // =================================================

    const historicalFloodData = {

        state: "Assam",

        districts: [
            "Cachar",
            "Hailakandi",
            "Karimganj"
        ],

        floodDate: "18-Jun-2023",

        sourceAgency: "NRSC / ISRO",

        satellite: "EOS-4 CRS SAR",

        mapId:
            "2023/FL/AS/04-VAP/18-Jun-2023",

        eventType:
            "Flood Inundation",

        mapFile:
            "/data/historical_flood_assam_2023.pdf"

    };


    // =================================================
    // UI
    // =================================================

    return (

        <div className="dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-header">

                <div className="brand">

                    <h1>
                        HILLGUARD AI
                    </h1>

                    <p>
                        Flash Flood Prediction & Early Warning System
                    </p>

                </div>


                <div className="status">

                    <span></span>

                    System Online

                </div>

            </header>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="stats">


                <div className="stat-card">

                    <h3>
                        Monitored Locations
                    </h3>

                    <strong>
                        {locations.length}
                    </strong>

                </div>


                <div className="stat-card">

                    <h3>
                        High Risk Areas
                    </h3>

                    <strong>
                        {
                            riskCounts.HIGH +
                            riskCounts.CRITICAL
                        }
                    </strong>

                </div>


                <div className="stat-card">

                    <h3>
                        Active Alerts
                    </h3>

                    <strong>
                        {riskCounts.CRITICAL}
                    </strong>

                </div>


                <div className="stat-card">

                    <h3>
                        IoT Sensors
                    </h3>

                    <strong>
                        {onlineIoTSensors}
                    </strong>

                </div>


            </section>


            {/* =================================================
                FILTERS
            ================================================= */}

            <section className="filter-section">


                <div className="filter-group">

                    <label>
                        State
                    </label>

                    <select
                        value={stateFilter}
                        onChange={(event) =>
                            setStateFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All States
                        </option>


                        {states.map(
                            (state) => (

                                <option
                                    key={state}
                                    value={state}
                                >
                                    {state}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="filter-group">

                    <label>
                        Risk Level
                    </label>

                    <select
                        value={riskFilter}
                        onChange={(event) =>
                            setRiskFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Risk Levels
                        </option>

                        <option value="LOW">
                            LOW
                        </option>

                        <option value="MEDIUM">
                            MEDIUM
                        </option>

                        <option value="HIGH">
                            HIGH
                        </option>

                        <option value="CRITICAL">
                            CRITICAL
                        </option>

                    </select>

                </div>


                <div className="filter-result">

                    Showing{" "}

                    <strong>
                        {filteredLocations.length}
                    </strong>

                    {" "}of{" "}

                    <strong>
                        {locations.length}
                    </strong>

                    {" "}locations

                </div>


            </section>


            {/* =================================================
                RISK SUMMARY
            ================================================= */}

            <section className="risk-summary">


                <div className="risk-box low">

                    <span>
                        LOW
                    </span>

                    <strong>
                        {riskCounts.LOW}
                    </strong>

                </div>


                <div className="risk-box medium">

                    <span>
                        MEDIUM
                    </span>

                    <strong>
                        {riskCounts.MEDIUM}
                    </strong>

                </div>


                <div className="risk-box high">

                    <span>
                        HIGH
                    </span>

                    <strong>
                        {riskCounts.HIGH}
                    </strong>

                </div>


                <div className="risk-box critical">

                    <span>
                        CRITICAL
                    </span>

                    <strong>
                        {riskCounts.CRITICAL}
                    </strong>

                </div>


            </section>


            {/* =================================================
                PHASE 4.4B.2
                HISTORICAL FLOOD DATA
            ================================================= */}

            <section className="historical-flood-section">

                <div className="section-header">

                    <div>

                        <h2>
                            🌊 Historical Flood Data
                        </h2>

                        <p>
                            Official historical flood inundation information
                        </p>

                    </div>


                    <span className="source-badge">
                        NRSC / ISRO
                    </span>

                </div>


                <div className="historical-flood-card">


                    <div className="flood-main">

                        <div className="flood-icon">
                            🌊
                        </div>

                        <div>

                            <h3>
                                Assam Flood Inundation – 2023
                            </h3>

                            <p>
                                Historical flood observation from
                                NRSC / ISRO
                            </p>

                        </div>

                    </div>


                    <div className="flood-details">


                        <div>

                            <span>
                                State
                            </span>

                            <strong>
                                {historicalFloodData.state}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Districts
                            </span>

                            <strong>
                                {
                                    historicalFloodData
                                        .districts
                                        .join(", ")
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Flood Date
                            </span>

                            <strong>
                                {
                                    historicalFloodData
                                        .floodDate
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Satellite
                            </span>

                            <strong>
                                {
                                    historicalFloodData
                                        .satellite
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Event Type
                            </span>

                            <strong>
                                {
                                    historicalFloodData
                                        .eventType
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Map ID
                            </span>

                            <strong>
                                {
                                    historicalFloodData
                                        .mapId
                                }
                            </strong>

                        </div>


                    </div>


                    <a
                        href={
                            historicalFloodData.mapFile
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-flood-map-btn"
                    >
                        🗺️ View Official Flood Map
                    </a>


                </div>

            </section>


            {/* =================================================
                RISK MONITORING MAP
            ================================================= */}

            <section className="map-section">

                <div className="section-header">

                    <div>

                        <h2>
                            🗺️ Risk Monitoring Map
                        </h2>

                        <p>
                            Location-level environmental risk monitoring
                        </p>

                    </div>

                </div>


                <div className="map-container">

                    <MapView
                        locations={
                            filteredLocations
                        }
                    />

                </div>

            </section>


            {/* =================================================
                MONITORED LOCATIONS
                PHASE 4.5.3 IoT INTEGRATION
            ================================================= */}

            <section className="locations-section">

                <div className="section-header">

                    <div>

                        <h2>
                            📍 Monitored Locations
                        </h2>

                        <p>
                            Location-level environmental monitoring
                        </p>

                    </div>

                </div>


                <div className="locations-grid">

                    {filteredLocations.length === 0 ? (

                        <div className="section-empty">

                            No locations found
                            for selected filters.

                        </div>

                    ) : (

                        filteredLocations.map(
                            (location) => {

                                const riskLevel =
                                    getCombinedRisk(
                                        location,
                                        weatherData,
                                        soilMoistureData
                                    );


                                const riskScore =
                                    getRiskScore(
                                        location,
                                        weatherData,
                                        soilMoistureData
                                    );


                                const terrainRisk =
                                    getTerrainRisk(
                                        location.slope
                                    );


                                const weather =
                                    getWeatherForLocation(
                                        location.location_id
                                    );


                                const soil =
                                    getSoilMoistureForLocation(
                                        location.location_id
                                    );


                                const iotSensor =
                                    getIoTSensorForLocation(
                                        location.location_id
                                    );


                                const historicalData =
                                    getHistoricalRainfallForLocation(
                                        location
                                    );


                                const historicalValues =
                                    historicalData.map(
                                        (item) =>
                                            Number(
                                                item.rainfall_mm
                                            )
                                    );


                                const maxHistoricalRainfall =
                                    historicalValues.length > 0
                                        ? Math.max(
                                            ...historicalValues
                                        )
                                        : null;


                                return (

                                    <div
                                        className="location-card"
                                        key={
                                            location.location_id
                                        }
                                    >


                                        {/* LOCATION HEADER */}

                                        <div className="location-card-header">

                                            <h3>
                                                {
                                                    location.name
                                                }
                                            </h3>

                                            <span
                                                className={
                                                    `risk-badge ${
                                                        riskLevel.toLowerCase()
                                                    }`
                                                }
                                            >
                                                {
                                                    riskLevel
                                                }
                                            </span>

                                        </div>


                                        <p>
                                            {
                                                location.district
                                            }
                                            ,{" "}
                                            {
                                                location.state
                                            }
                                        </p>


                                        {/* TERRAIN */}

                                        <div className="terrain-info">

                                            <div>

                                                <span>
                                                    ⛰️ Elevation
                                                </span>

                                                <strong>
                                                    {
                                                        location.elevation ??
                                                        "N/A"
                                                    } m
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    📐 Slope
                                                </span>

                                                <strong>
                                                    {
                                                        location.slope ??
                                                        "N/A"
                                                    }°
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    🗻 Terrain
                                                </span>

                                                <strong>
                                                    {
                                                        terrainRisk
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {/* RISK SCORE */}

                                        <div className="risk-score">

                                            <span>
                                                Combined Risk Score
                                            </span>

                                            <strong>
                                                {
                                                    riskScore
                                                } / 100
                                            </strong>

                                        </div>


                                        {/* WEATHER */}

                                        {
                                            weatherLoading ? (

                                                <p className="weather-loading">

                                                    Loading rainfall...

                                                </p>

                                            ) : !weather ? (

                                                <p className="weather-error">

                                                    Weather data unavailable

                                                </p>

                                            ) : (

                                                <div className="weather-info">


                                                    <div>

                                                        <span>
                                                            🌧️ Rainfall
                                                        </span>

                                                        <strong>
                                                            {
                                                                weather.rainfall ??
                                                                "N/A"
                                                            } mm
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            💧 Precipitation
                                                        </span>

                                                        <strong>
                                                            {
                                                                weather.precipitation ??
                                                                "N/A"
                                                            } mm
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            📊 Rain Probability
                                                        </span>

                                                        <strong>
                                                            {
                                                                weather.precipitation_probability ??
                                                                "N/A"
                                                            }%
                                                        </strong>

                                                    </div>


                                                </div>

                                            )
                                        }


                                        {/* SOIL MOISTURE */}

                                        {
                                            soilMoistureLoading ? (

                                                <p className="soil-loading">

                                                    Loading soil moisture...

                                                </p>

                                            ) : !soil ? (

                                                <p className="soil-error">

                                                    Soil moisture data unavailable

                                                </p>

                                            ) : (

                                                <div className="soil-moisture-info">


                                                    <div>

                                                        <span>
                                                            🌱 Soil Moisture
                                                        </span>

                                                        <strong>
                                                            {
                                                                soil.moisture_percent ??
                                                                "N/A"
                                                            }%
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Moisture Level
                                                        </span>

                                                        <strong>
                                                            {
                                                                soil.moisture_level ??
                                                                "N/A"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Sensor
                                                        </span>

                                                        <strong>
                                                            {
                                                                soil.sensor_status ??
                                                                "N/A"
                                                            }
                                                        </strong>

                                                    </div>


                                                </div>

                                            )
                                        }


                                        {/* =================================================
                                            IoT SENSOR
                                        ================================================= */}

                                        {
                                            iotSensorLoading ? (

                                                <p className="iot-loading">

                                                    Loading IoT sensor data...

                                                </p>

                                            ) : !iotSensor ? (

                                                <div className="iot-no-data">

                                                    📡 No IoT sensor data available

                                                </div>

                                            ) : (

                                                <div className="iot-sensor-info">


                                                    <div className="iot-header">

                                                        <span>
                                                            📡 IoT Sensor
                                                        </span>

                                                        <strong
                                                            className={
                                                                String(
                                                                    iotSensor.sensor_status
                                                                ).toUpperCase() ===
                                                                "ONLINE"
                                                                    ? "sensor-online"
                                                                    : "sensor-offline"
                                                            }
                                                        >
                                                            {
                                                                iotSensor.sensor_status ??
                                                                "UNKNOWN"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Sensor ID
                                                        </span>

                                                        <strong>
                                                            {
                                                                iotSensor.sensor_id ??
                                                                "N/A"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            🌧️ Rainfall
                                                        </span>

                                                        <strong>

                                                            {
                                                                iotSensor.rainfall_mm !==
                                                                    null &&
                                                                iotSensor.rainfall_mm !==
                                                                    undefined
                                                                    ? `${Number(
                                                                        iotSensor.rainfall_mm
                                                                    ).toFixed(
                                                                        2
                                                                    )} mm`
                                                                    : "N/A"
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            🌱 Soil Moisture
                                                        </span>

                                                        <strong>

                                                            {
                                                                iotSensor.soil_moisture_percent !==
                                                                    null &&
                                                                iotSensor.soil_moisture_percent !==
                                                                    undefined
                                                                    ? `${Number(
                                                                        iotSensor.soil_moisture_percent
                                                                    ).toFixed(
                                                                        2
                                                                    )} %`
                                                                    : "N/A"
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            💧 Water Level
                                                        </span>

                                                        <strong>

                                                            {
                                                                iotSensor.water_level_m !==
                                                                    null &&
                                                                iotSensor.water_level_m !==
                                                                    undefined
                                                                    ? `${Number(
                                                                        iotSensor.water_level_m
                                                                    ).toFixed(
                                                                        2
                                                                    )} m`
                                                                    : "N/A"
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Last Updated
                                                        </span>

                                                        <strong>

                                                            {
                                                                iotSensor.recorded_at
                                                                    ? new Date(
                                                                        iotSensor.recorded_at
                                                                    ).toLocaleString()
                                                                    : "N/A"
                                                            }

                                                        </strong>

                                                    </div>


                                                </div>

                                            )
                                        }


                                        {/* HISTORICAL RAINFALL */}

                                        {
                                            historicalRainfallLoading ? (

                                                <p className="historical-loading">

                                                    Loading historical rainfall...

                                                </p>

                                            ) : (

                                                <div className="historical-info">


                                                    <div>

                                                        <span>
                                                            📚 Historical Records
                                                        </span>

                                                        <strong>
                                                            {
                                                                historicalData.length
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            🌧️ Max Historical Rainfall
                                                        </span>

                                                        <strong>

                                                            {
                                                                maxHistoricalRainfall !==
                                                                null
                                                                    ? `${maxHistoricalRainfall.toFixed(
                                                                        2
                                                                    )} mm`
                                                                    : "No nearby data"
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Data Source
                                                        </span>

                                                        <strong>
                                                            CWC
                                                        </strong>

                                                    </div>


                                                </div>

                                            )
                                        }


                                        {/* COORDINATES */}

                                        <div className="location-coordinates">

                                            <span>
                                                📍 Coordinates
                                            </span>

                                            <strong>
                                                {
                                                    location.latitude
                                                }
                                                ,{" "}
                                                {
                                                    location.longitude
                                                }
                                            </strong>

                                        </div>


                                    </div>

                                );

                            }
                        )

                    )}

                </div>

            </section>


        </div>

    );

}

export default Dashboard;