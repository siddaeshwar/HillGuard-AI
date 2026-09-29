const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                location_id,
                name,
                location_type,
                district,
                state,
                latitude,
                longitude,
                elevation,
                slope
            FROM locations
            ORDER BY location_id;
        `);

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;