const mongoose = require("mongoose");
const Itinerary = require("../models/Itinerary");
const Trip = require("../models/Trip");

// =====================================================
// GET SAVED ITINERARY
// =====================================================

const getTripItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Validate trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    // Check that user is a member of the trip
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

    // Find saved itinerary
    const itinerary = await Itinerary.findOne({
      trip: tripId,
    });

    return res.status(200).json({
      success: true,
      itinerary: itinerary || null,
    });
  } catch (error) {
    console.error("Get itinerary error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching itinerary",
    });
  }
};

module.exports = {
  getTripItinerary,
};