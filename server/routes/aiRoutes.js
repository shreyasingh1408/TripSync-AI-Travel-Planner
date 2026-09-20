const express = require("express");

const {
  generateItinerary,
  replanItinerary,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Generate new itinerary
router.post(
  "/generate-itinerary",
  protect,
  generateItinerary
);

// Re-plan existing itinerary
router.post(
  "/replan",
  protect,
  replanItinerary
);

module.exports = router;