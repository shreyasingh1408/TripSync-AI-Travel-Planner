const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    tripType: {
      type: String,
      required: true,
      enum: ["solo", "couple", "family", "group"],
    },

    travellers: {
      type: Number,
      required: true,
      min: 1,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    preferences: {
      interests: {
        type: [String],
        default: [],
      },

      food: {
        type: String,
        default: "",
        trim: true,
      },

      walking: {
        type: String,
        default: "",
        trim: true,
      },

      travelStyle: {
        type: String,
        default: "",
        trim: true,
      },
    },

    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);