const express = require("express");

const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// Trip Routes
// ===============================

// Create trip
router.post("/", protect, createTrip);

// Get all trips for logged-in user
router.get("/", protect, getMyTrips);

// Get single trip
router.get("/:id", protect, getTripById);

// Update trip
router.put("/:id", protect, updateTrip);

// Delete trip
router.delete("/:id", protect, deleteTrip);

module.exports = router;

