const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

// Add expense
const createExpense = async (req, res) => {
  try {
    const { tripId } = req.params;

    const {
      amount,
      category,
      description,
      date,
    } = req.body;

    // Validate trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    // Validate required fields
    if (amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Amount and category are required",
      });
    }

    // Check trip and user access
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

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative",
      });
    }

    const expense = await Expense.create({
      trip: tripId,
      paidBy: req.user._id,
      amount,
      category,
      description,
      date: date || Date.now(),
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email");

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error("Create expense error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating expense",
    });
  }
};

// Get all expenses for a trip
const getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    // Check user access
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

    const expenses = await Expense.find({
      trip: tripId,
    })
      .populate("paidBy", "name email")
      .sort({ date: -1, createdAt: -1 });

    const totalExpense = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalExpense,
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching expenses",
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID or expense ID",
      });
    }

    // Check that user belongs to the trip
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

    const expense = await Expense.findOne({
      _id: expenseId,
      trip: tripId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Only the person who paid can update the expense
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the user who created the expense can update it",
      });
    }

    const {
      amount,
      category,
      description,
      date,
    } = req.body;

    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount cannot be negative",
        });
      }

      expense.amount = amount;
    }

    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email");

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Update expense error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while updating expense",
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID or expense ID",
      });
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      trip: tripId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Only the person who created the expense can delete it
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the user who created the expense can delete it",
      });
    }

    await Expense.findByIdAndDelete(expenseId);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting expense",
    });
  }
};

module.exports = {
  createExpense,
  getTripExpenses,
  updateExpense,
  deleteExpense,
};