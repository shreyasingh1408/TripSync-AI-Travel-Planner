const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    ageGroup: {
      type: String,
      enum: ["child", "adult", "senior"],
      default: "adult",
    },

    food: {
      type: String,
      enum: ["", "veg", "non-veg", "vegan", "any"],
      default: "",
    },

    walking: {
      type: String,
      enum: ["", "low", "medium", "high"],
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);