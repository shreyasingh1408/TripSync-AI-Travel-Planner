const mongoose = require("mongoose");
const Member = require("../models/Member");
const Trip = require("../models/Trip");

// Build the trip response with member preferences
const buildTripWithMembers = async (tripId) => {
  const trip = await Trip.findById(tripId)
    .populate("createdBy", "name email")
    .populate("members", "name email");

  if (!trip) {
    return null;
  }

  // Get all member preference records
  const memberPreferences = await Member.find({
    trip: tripId,
  }).sort({ createdAt: 1 });

  const tripObject = trip.toObject();

  // Frontend expects trip.members to contain:
  // name, ageGroup, food, walking
  tripObject.members = memberPreferences.map((member) => ({
    _id: member._id,
    name: member.name,
    ageGroup: member.ageGroup || "adult",
    food: member.food || "",
    walking: member.walking || "",
  }));

  return tripObject;
};

// =====================================================
// ADD MEMBER
// =====================================================

const addMember = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, ageGroup, food, walking } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member name is required",
      });
    }

    // Only trip owner can add members
    const trip = await Trip.findOne({
      _id: tripId,
      createdBy: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you are not the trip owner",
      });
    }

    // Create preference record
    const member = await Member.create({
      trip: tripId,
      name: name.trim(),
      ageGroup: ageGroup || "adult",
      food: food || "",
      walking: walking || "",
      createdBy: req.user._id,
    });

    // Return trip in the format expected by frontend
    const updatedTrip = await buildTripWithMembers(tripId);

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      member,
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Add member error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while adding member",
    });
  }
};

// =====================================================
// GET MEMBERS
// =====================================================

const getTripMembers = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findOne({
      _id: tripId,
      members: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you are not a member",
      });
    }

    const members = await Member.find({
      trip: tripId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get members error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching members",
    });
  }
};

// =====================================================
// UPDATE MEMBER
// =====================================================

const updateMember = async (req, res) => {
  try {
    const { tripId, memberId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID or member ID",
      });
    }

    const trip = await Trip.findOne({
      _id: tripId,
      createdBy: req.user._id,
    });

    if (!trip) {
      return res.status(403).json({
        success: false,
        message: "Only the trip owner can update members",
      });
    }

    const member = await Member.findOne({
      _id: memberId,
      trip: tripId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const { name, ageGroup, food, walking } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Member name cannot be empty",
        });
      }

      member.name = name.trim();
    }

    if (ageGroup !== undefined) {
      member.ageGroup = ageGroup;
    }

    if (food !== undefined) {
      member.food = food;
    }

    if (walking !== undefined) {
      member.walking = walking;
    }

    await member.save();

    const updatedTrip = await buildTripWithMembers(tripId);

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      member,
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Update member error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while updating member",
    });
  }
};

// =====================================================
// DELETE MEMBER
// =====================================================

const deleteMember = async (req, res) => {
  try {
    const { tripId, memberId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID or member ID",
      });
    }

    const trip = await Trip.findOne({
      _id: tripId,
      createdBy: req.user._id,
    });

    if (!trip) {
      return res.status(403).json({
        success: false,
        message: "Only the trip owner can delete members",
      });
    }

    const member = await Member.findOneAndDelete({
      _id: memberId,
      trip: tripId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const updatedTrip = await buildTripWithMembers(tripId);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Delete member error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting member",
    });
  }
};

module.exports = {
  addMember,
  getTripMembers,
  updateMember,
  deleteMember,
};