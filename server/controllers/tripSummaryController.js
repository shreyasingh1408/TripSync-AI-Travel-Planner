const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Itinerary = require("../models/Itinerary");
const Expense = require("../models/Expense");

// Get complete trip summary
const getTripSummary = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Validate trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    // Get trip and make sure user is a member
    const trip = await Trip.findOne({
      _id: tripId,
      members: req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you are not a member",
      });
    }

    // Get itinerary
    const itinerary = await Itinerary.find({
      trip: tripId,
    }).sort({
      day: 1,
      startTime: 1,
    });

    // Get expenses
    const expenses = await Expense.find({
      trip: tripId,
    })
      .populate("paidBy", "name email")
      .sort({
        date: -1,
        createdAt: -1,
      });

    // Calculate total expense
    const totalExpense = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    // Calculate remaining budget
    const remainingBudget = trip.budget - totalExpense;

    res.status(200).json({
      success: true,

      trip: {
        id: trip._id,
        title: trip.title,
        destination: trip.destination,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        createdBy: trip.createdBy,
        members: trip.members,
      },

      itinerary: {
        count: itinerary.length,
        items: itinerary,
      },

      expenses: {
        count: expenses.length,
        total: totalExpense,
        items: expenses,
      },

      financialSummary: {
        budget: trip.budget,
        totalExpense,
        remainingBudget,
      },
    });
  } catch (error) {
    console.error("Get trip summary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching trip summary",
    });
  }
};

module.exports = {
  getTripSummary,
};