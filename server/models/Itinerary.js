const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      unique: true,
    },

    estimatedTotalCost: {
      type: Number,
      default: 0,
    },

    days: [
      {
        day: {
          type: Number,
          required: true,
        },

        date: {
          type: String,
          required: true,
        },

        estimatedDayCost: {
          type: Number,
          default: 0,
        },

        activities: [
          {
            name: {
              type: String,
              required: true,
            },

            time: {
              type: String,
              default: "",
            },

            location: {
              type: String,
              default: "",
            },

            duration: {
              type: String,
              default: "",
            },

            estimatedCost: {
              type: Number,
              default: 0,
            },

            reason: {
              type: String,
              default: "",
            },
          },
        ],
      },
    ],

    // =====================================================
    // RE-PLAN HISTORY
    // =====================================================

    replanHistory: [
      {
        instruction: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },

        // Previous itinerary snapshot
        itinerary: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Itinerary", itinerarySchema);