const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Member = require("../models/Member");

// =====================================================
// Generate unique join code
// =====================================================

const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// =====================================================
// Build trip with member preferences
// =====================================================

const buildTripResponse = async (tripId) => {
  const trip = await Trip.findById(tripId)
    .populate("createdBy", "name email")
    .populate("members", "name email");

  if (!trip) {
    return null;
  }

  // Get member preference records
  const memberPreferences = await Member.find({
    trip: tripId,
  }).sort({ createdAt: 1 });

  const tripObject = trip.toObject();

  // The frontend displays trip.members,
  // so return the preference records here.
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
// CREATE TRIP
// =====================================================

const createTrip = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      tripType,
      travellers,
      budget,
      preferences,
    } = req.body;

    if (
      !destination ||
      !startDate ||
      !endDate ||
      !tripType ||
      travellers === undefined ||
      budget === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Destination, start date, end date, trip type, travellers and budget are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    if (Number(travellers) < 1) {
      return res.status(400).json({
        success: false,
        message: "Travellers must be at least 1",
      });
    }

    if (Number(budget) < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget cannot be negative",
      });
    }

    // Generate unique join code
    let joinCode;
    let existingTrip;

    do {
      joinCode = generateJoinCode();

      existingTrip = await Trip.findOne({
        joinCode,
      });
    } while (existingTrip);

    const trip = await Trip.create({
      destination: destination.trim(),
      startDate: start,
      endDate: end,
      tripType,
      travellers: Number(travellers),
      budget: Number(budget),

      preferences: {
        interests: preferences?.interests || [],
        food: preferences?.food || "",
        walking: preferences?.walking || "",
        travelStyle: preferences?.travelStyle || "",
      },

      joinCode,

      createdBy: req.user._id,

      members: [req.user._id],
    });

    // Create a preference record for the creator
    await Member.create({
      trip: trip._id,
      name: req.user.name || "Trip Creator",
      ageGroup: "adult",
      food: preferences?.food || "",
      walking: preferences?.walking || "",
      createdBy: req.user._id,
    });

    const populatedTrip = await buildTripResponse(trip._id);

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("Create trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating trip",
    });
  }
};

// =====================================================
// GET MY TRIPS
// =====================================================

const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      members: req.user._id,
    }).sort({ createdAt: -1 });

    const tripsWithMembers = await Promise.all(
      trips.map(async (trip) => {
        return await buildTripResponse(trip._id);
      })
    );

    res.status(200).json({
      success: true,
      count: tripsWithMembers.length,
      trips: tripsWithMembers,
    });
  } catch (error) {
    console.error("Get trips error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching trips",
    });
  }
};

// =====================================================
// GET TRIP BY ID
// =====================================================

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findOne({
      _id: id,
      members: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const tripResponse = await buildTripResponse(id);

    res.status(200).json({
      success: true,
      trip: tripResponse,
    });
  } catch (error) {
    console.error("Get trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching trip",
    });
  }
};

// =====================================================
// UPDATE TRIP
// =====================================================

const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message:
          "Trip not found or you are not the trip owner",
      });
    }

    const {
      destination,
      startDate,
      endDate,
      tripType,
      travellers,
      budget,
      preferences,
    } = req.body;

    if (destination !== undefined) {
      trip.destination = destination.trim();
    }

    if (startDate !== undefined) {
      trip.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      trip.endDate = new Date(endDate);
    }

    if (tripType !== undefined) {
      trip.tripType = tripType;
    }

    if (travellers !== undefined) {
      if (Number(travellers) < 1) {
        return res.status(400).json({
          success: false,
          message: "Travellers must be at least 1",
        });
      }

      trip.travellers = Number(travellers);
    }

    if (budget !== undefined) {
      if (Number(budget) < 0) {
        return res.status(400).json({
          success: false,
          message: "Budget cannot be negative",
        });
      }

      trip.budget = Number(budget);
    }

    if (preferences !== undefined) {
      trip.preferences = {
        interests: preferences.interests || [],
        food: preferences.food || "",
        walking: preferences.walking || "",
        travelStyle: preferences.travelStyle || "",
      };
    }

    if (
      isNaN(new Date(trip.startDate).getTime()) ||
      isNaN(new Date(trip.endDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip dates",
      });
    }

    if (trip.endDate < trip.startDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    await trip.save();

    const updatedTrip = await buildTripResponse(trip._id);

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Update trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while updating trip",
    });
  }
};

// =====================================================
// DELETE TRIP
// =====================================================

const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message:
          "Trip not found or you are not the trip owner",
      });
    }

    // Remove itinerary/member preference records
    await Member.deleteMany({
      trip: id,
    });

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting trip",
    });
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};