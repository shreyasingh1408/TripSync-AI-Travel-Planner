const express = require("express");

const {
  addMember,
  getTripMembers,
  updateMember,
  deleteMember,
} = require("../controllers/memberController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add member to a trip
router.post("/:tripId", protect, addMember);

// Get all members of a trip
router.get("/:tripId", protect, getTripMembers);

// Update member preferences
router.put("/:tripId/:memberId", protect, updateMember);

// Delete member
router.delete("/:tripId/:memberId", protect, deleteMember);

module.exports = router;