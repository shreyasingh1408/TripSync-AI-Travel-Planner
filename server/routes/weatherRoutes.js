const express = require("express");

const { getWeather } = require("../controllers/weatherController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get weather for a trip
router.get("/:tripId", protect, getWeather);

module.exports = router;