const express = require("express");

const {
  getTripItinerary,
} = require("../controllers/itineraryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get saved itinerary for a trip
router.get("/:tripId", protect, getTripItinerary);

module.exports = router;