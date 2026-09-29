import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "../pages/Dashboard.css";


// =====================================================
// DEFAULT LEAFLET MARKER
// =====================================================

const DefaultIcon = L.icon({

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],

    shadowSize: [41, 41]

});


L.Marker.prototype.options.icon = DefaultIcon;


// =====================================================
// RISK CONFIGURATION
// =====================================================

const riskConfig = {

    LOW: {
        color: "#22c55e",
        background: "#dcfce7",
        text: "#166534"
    },

    MEDIUM: {
        color: "#eab308",
        background: "#fef9c3",
        text: "#854d0e"
    },

    HIGH: {
        color: "#f97316",
        background: "#ffedd5",
        text: "#9a3412"
    },

    CRITICAL: {
        color: "#ef4444",
        background: "#fee2e2",
        text: "#991b1b"
    }

};


// =====================================================
// CREATE CUSTOM RISK ICON
// =====================================================

function createRiskIcon(riskLevel) {

    const risk =
        riskConfig[riskLevel] || riskConfig.LOW;

    return L.divIcon({

        className: "risk-marker-wrapper",

        html: `
            <div
                class="risk-marker"
                style="
                    background:${risk.color};
                    box-shadow:
                        0 0 0 5px ${risk.color}33,
                        0 4px 12px rgba(0,0,0,0.35);
                "
            >
                <span>!</span>
            </div>
        `,

        iconSize: [38, 38],

        iconAnchor: [19, 19],

        popupAnchor: [0, -20]

    });
}


// =====================================================
// CALCULATE DEMO RISK
// =====================================================

function calculateRisk(location) {

    /*
        TEMPORARY DEMO LOGIC

        Later this will be replaced by:

        Rainfall
        +
        Soil Moisture
        +
        Slope
        +
        Historical Data
        +
        IoT
        ↓
        AI Risk Prediction
    */


    const slope =
        Number(location.slope || 0);


    if (slope >= 35) {

        return "CRITICAL";

    }


    if (slope >= 25) {

        return "HIGH";

    }


    if (slope >= 15) {

        return "MEDIUM";

    }


    return "LOW";
}


// =====================================================
// FIT MAP TO FILTERED LOCATIONS
// =====================================================

function FitBounds({ locations }) {

    const map = useMap();


    useEffect(() => {

        if (!locations || locations.length === 0) {

            return;

        }


        const validLocations =
            locations.filter(
                (location) =>
                    location.latitude !== null &&
                    location.longitude !== null
            );


        if (validLocations.length === 0) {

            return;

        }


        const bounds = L.latLngBounds(

            validLocations.map((location) => [

                Number(location.latitude),

                Number(location.longitude)

            ])

        );


        map.fitBounds(bounds, {

            padding: [40, 40]

        });


    }, [locations, map]);


    return null;
}


// =====================================================
// MAIN MAP COMPONENT
// =====================================================

function MapView({ locations = [] }) {

    const defaultCenter = [

        25.5,

        92.5

    ];


    return (

        <div className="map-wrapper">


            {/* =========================================
                NO LOCATION MESSAGE
            ========================================= */}

            {locations.length === 0 ? (

                <div className="map-message">

                    No locations match the selected filters.

                </div>

            ) : (

                <MapContainer

                    center={defaultCenter}

                    zoom={6}

                    scrollWheelZoom={true}

                    className="hillguard-map"

                >


                    {/* =====================================
                        OPEN STREET MAP
                    ===================================== */}

                    <TileLayer

                        attribution='&copy; OpenStreetMap contributors'

                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    />


                    {/* =====================================
                        FIT MAP TO FILTERED LOCATIONS
                    ===================================== */}

                    <FitBounds

                        locations={locations}

                    />


                    {/* =====================================
                        LOCATION MARKERS
                    ===================================== */}

                    {locations.map((location) => {


                        const latitude =
                            Number(location.latitude);


                        const longitude =
                            Number(location.longitude);


                        // Ignore invalid coordinates

                        if (

                            Number.isNaN(latitude) ||

                            Number.isNaN(longitude)

                        ) {

                            return null;

                        }


                        // Calculate risk

                        const riskLevel =
                            location.risk ||
                            calculateRisk(location);


                        const risk =
                            riskConfig[riskLevel] ||
                            riskConfig.LOW;


                        return (

                            <div
                                key={location.location_id}
                            >


                                {/* =========================
                                    RISK CIRCLE
                                ========================= */}

                                <Circle

                                    center={[

                                        latitude,

                                        longitude

                                    ]}

                                    radius={1000}

                                    pathOptions={{

                                        color:
                                            risk.color,

                                        fillColor:
                                            risk.color,

                                        fillOpacity: 0.12,

                                        weight: 2

                                    }}

                                />


                                {/* =========================
                                    RISK MARKER
                                ========================= */}

                                <Marker

                                    position={[

                                        latitude,

                                        longitude

                                    ]}

                                    icon={

                                        createRiskIcon(

                                            riskLevel

                                        )

                                    }

                                >


                                    {/* =====================
                                        POPUP
                                    ===================== */}

                                    <Popup>

                                        <div className="location-popup">


                                            <h3>

                                                {location.name}

                                            </h3>


                                            <div

                                                className="risk-badge"

                                                style={{

                                                    background:
                                                        risk.background,

                                                    color:
                                                        risk.text

                                                }}

                                            >

                                                {riskLevel}

                                            </div>


                                            <p>

                                                <strong>
                                                    District:
                                                </strong>{" "}

                                                {location.district ||

                                                    "N/A"}

                                            </p>


                                            <p>

                                                <strong>
                                                    State:
                                                </strong>{" "}

                                                {location.state ||

                                                    "N/A"}

                                            </p>


                                            <p>

                                                <strong>
                                                    Elevation:
                                                </strong>{" "}

                                                {location.elevation ||

                                                    "N/A"} m

                                            </p>


                                            <p>

                                                <strong>
                                                    Slope:
                                                </strong>{" "}

                                                {location.slope ||

                                                    "N/A"}°

                                            </p>


                                            <p>

                                                <strong>
                                                    Latitude:
                                                </strong>{" "}

                                                {latitude}

                                            </p>


                                            <p>

                                                <strong>
                                                    Longitude:
                                                </strong>{" "}

                                                {longitude}

                                            </p>


                                            <hr />


                                            <p className="risk-note">

                                                Risk currently estimated
                                                from slope data.

                                            </p>


                                        </div>

                                    </Popup>


                                </Marker>


                            </div>

                        );

                    })}


                </MapContainer>

            )}


            {/* =========================================
                MAP LEGEND
            ========================================= */}

            <div className="risk-legend">

                <h4>
                    Flood Risk
                </h4>


                <div>

                    <span
                        className="legend-dot low"
                    ></span>

                    LOW

                </div>


                <div>

                    <span
                        className="legend-dot medium"
                    ></span>

                    MEDIUM

                </div>


                <div>

                    <span
                        className="legend-dot high"
                    ></span>

                    HIGH

                </div>


                <div>

                    <span
                        className="legend-dot critical"
                    ></span>

                    CRITICAL

                </div>

            </div>


        </div>

    );

}


export default MapView;