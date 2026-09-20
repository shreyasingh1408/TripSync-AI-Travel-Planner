const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

const Trip = require("../models/Trip");
const Itinerary = require("../models/Itinerary");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanJsonResponse = (text) => {
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  let cleaned = text.trim();

  // Remove markdown code fences if Gemini returns them
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  return cleaned.trim();
};

const normalizeItinerary = (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary.days)) {
    throw new Error("Invalid itinerary structure returned by Gemini");
  }

  let estimatedTotalCost = 0;

  const days = itinerary.days.map((day, dayIndex) => {
    const activities = Array.isArray(day.activities)
      ? day.activities.map((activity) => ({
          name: String(activity.name || "Activity"),
          time: String(activity.time || ""),
          location: String(activity.location || ""),
          duration: String(activity.duration || ""),
          estimatedCost: Number(activity.estimatedCost) || 0,
          reason: String(activity.reason || ""),
        }))
      : [];

    const estimatedDayCost = activities.reduce(
      (sum, activity) => sum + activity.estimatedCost,
      0
    );

    estimatedTotalCost += estimatedDayCost;

    return {
      day: Number(day.day) || dayIndex + 1,
      date: String(day.date || ""),
      estimatedDayCost,
      activities,
    };
  });

  return {
    estimatedTotalCost,
    days,
  };
};

// ----------------------------------------------------
// Gemini request with retry + fallback
// ----------------------------------------------------

const isRetryableError = (error) => {
  const status =
    error?.status ||
    error?.code ||
    error?.response?.status ||
    error?.error?.code;

  return [429, 500, 502, 503, 504].includes(Number(status));
};

const getErrorStatus = (error) => {
  return (
    error?.status ||
    error?.code ||
    error?.response?.status ||
    error?.error?.code ||
    null
  );
};

const generateWithFallback = async (prompt) => {
  /*
   * Primary model first.
   * If it is temporarily unavailable, retry and then
   * move to another supported Flash model.
   */
  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
  ];

  const maxRetriesPerModel = 2;

  let lastError = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(
          `Gemini request -> model=${model}, attempt=${attempt + 1}`
        );

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.7,
          },
        });

        const text = response?.text;

        if (!text) {
          throw new Error("Gemini returned an empty response");
        }

        console.log(`Gemini success -> model=${model}`);

        return text;
      } catch (error) {
        lastError = error;

        const status = getErrorStatus(error);

        console.error(
          `Gemini error -> model=${model}, attempt=${attempt + 1}, status=${status}, message=${error.message}`
        );

        // Do not retry permanent client/configuration errors
        if (!isRetryableError(error)) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < maxRetriesPerModel) {
          const delay = 2000 * Math.pow(2, attempt);

          console.log(
            `Retrying Gemini in ${delay / 1000} seconds...`
          );

          await sleep(delay);
        }
      }
    }

    console.log(
      `Model ${model} failed after retries. Trying fallback model...`
    );
  }

  throw lastError || new Error("All Gemini models failed");
};

// ----------------------------------------------------
// Generate itinerary
// ----------------------------------------------------

const generateItinerary = async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "tripId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    const trip = await Trip.findOne({
      _id: tripId,
      members: req.user._id,
    }).populate("members", "name");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you are not a member",
      });
    }

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    const tripDays =
      Math.floor(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      ) + 1;

    const memberNames =
      trip.members?.map((member) => member.name).filter(Boolean) || [];

    const prompt = `
You are an expert travel planner.

Create a personalized travel itinerary.

TRIP DETAILS
Destination: ${trip.destination}
Start Date: ${startDate.toISOString().split("T")[0]}
End Date: ${endDate.toISOString().split("T")[0]}
Number of Days: ${tripDays}
Trip Type: ${trip.tripType}
Travellers: ${trip.travellers}
Budget: ₹${trip.budget}

TRIP PREFERENCES
Interests: ${(trip.preferences?.interests || []).join(", ")}
Food Preference: ${trip.preferences?.food || "Any"}
Walking Preference: ${trip.preferences?.walking || "Medium"}
Travel Style: ${trip.preferences?.travelStyle || "Balanced"}

TRAVELLERS
${memberNames.length ? memberNames.join(", ") : "Not specified"}

IMPORTANT REQUIREMENTS
1. Create exactly ${tripDays} days.
2. Keep activities realistic for the destination.
3. Consider the provided budget.
4. Avoid excessive travel between locations.
5. Include realistic activity times.
6. Include estimated costs in INR.
7. Give a short reason for each activity.
8. Do not include unnecessary explanations outside JSON.

RETURN ONLY VALID JSON.

JSON FORMAT:
{
  "estimatedTotalCost": 0,
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "estimatedDayCost": 0,
      "activities": [
        {
          "name": "Activity name",
          "time": "09:00 AM",
          "location": "Location",
          "duration": "2 hours",
          "estimatedCost": 500,
          "reason": "Why this activity fits the trip"
        }
      ]
    }
  ]
}
`;

    const rawText = await generateWithFallback(prompt);

    const cleaned = cleanJsonResponse(rawText);

    let itinerary;

    try {
      itinerary = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Gemini JSON parse error:", parseError.message);
      console.error("Gemini raw response:", rawText);

      return res.status(502).json({
        success: false,
        message: "Gemini returned an invalid itinerary format",
      });
    }

    if (
      !Array.isArray(itinerary.days) ||
      itinerary.days.length !== tripDays
    ) {
      return res.status(502).json({
        success: false,
        message: "Gemini returned an incorrect number of itinerary days",
      });
    }

    const normalized = normalizeItinerary(itinerary);

    const savedItinerary = await Itinerary.findOneAndUpdate(
      { trip: tripId },
      {
        trip: tripId,
        estimatedTotalCost: normalized.estimatedTotalCost,
        days: normalized.days,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "AI itinerary generated successfully",
      itinerary: savedItinerary,
    });
  } catch (error) {
    console.error("Generate itinerary error:", error);

    const status = getErrorStatus(error);

    if ([429, 500, 502, 503, 504].includes(Number(status))) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is temporarily busy. Please try generating the itinerary again in a moment.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate itinerary",
    });
  }
};

// ----------------------------------------------------
// Re-plan itinerary
// ----------------------------------------------------

const replanItinerary = async (req, res) => {
  try {
    const { tripId, instruction } = req.body;

    if (!tripId || !instruction?.trim()) {
      return res.status(400).json({
        success: false,
        message: "tripId and instruction are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    const trip = await Trip.findOne({
      _id: tripId,
      members: req.user._id,
    }).populate("members", "name");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you are not a member",
      });
    }

    const existingItinerary = await Itinerary.findOne({
      trip: tripId,
    });

    if (!existingItinerary) {
      return res.status(404).json({
        success: false,
        message: "Generate an itinerary before using Re-plan",
      });
    }

    const previousItinerarySnapshot = {
      estimatedTotalCost: existingItinerary.estimatedTotalCost,
      days: existingItinerary.days.map((day) => ({
        day: day.day,
        date: day.date,
        estimatedDayCost: day.estimatedDayCost,
        activities: day.activities.map((activity) => ({
          name: activity.name,
          time: activity.time,
          location: activity.location,
          duration: activity.duration,
          estimatedCost: activity.estimatedCost,
          reason: activity.reason,
        })),
      })),
    };

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    const tripDays =
      Math.floor(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      ) + 1;

    const prompt = `
You are an expert travel planner modifying an existing itinerary.

TRIP DETAILS
Destination: ${trip.destination}
Start Date: ${startDate.toISOString().split("T")[0]}
End Date: ${endDate.toISOString().split("T")[0]}
Number of Days: ${tripDays}
Trip Type: ${trip.tripType}
Travellers: ${trip.travellers}
Budget: ₹${trip.budget}

PREFERENCES
Interests: ${(trip.preferences?.interests || []).join(", ")}
Food Preference: ${trip.preferences?.food || "Any"}
Walking Preference: ${trip.preferences?.walking || "Medium"}
Travel Style: ${trip.preferences?.travelStyle || "Balanced"}

CURRENT ITINERARY
${JSON.stringify(previousItinerarySnapshot, null, 2)}

USER'S RE-PLANNING REQUEST
"${instruction.trim()}"

INSTRUCTIONS
1. Modify the existing itinerary according to the user's request.
2. Preserve activities that are not affected by the request.
3. Keep exactly ${tripDays} days.
4. Keep dates unchanged.
5. Keep the itinerary realistic.
6. Consider travel time between locations.
7. Respect the trip budget as much as possible.
8. Return ONLY valid JSON.

JSON FORMAT:
{
  "estimatedTotalCost": 0,
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "estimatedDayCost": 0,
      "activities": [
        {
          "name": "Activity name",
          "time": "09:00 AM",
          "location": "Location",
          "duration": "2 hours",
          "estimatedCost": 500,
          "reason": "Why this activity fits"
        }
      ]
    }
  ]
}
`;

    const rawText = await generateWithFallback(prompt);

    const cleaned = cleanJsonResponse(rawText);

    let newItinerary;

    try {
      newItinerary = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Re-plan JSON parse error:", parseError.message);
      console.error("Gemini raw response:", rawText);

      return res.status(502).json({
        success: false,
        message: "Gemini returned an invalid re-planned itinerary",
      });
    }

    if (
      !Array.isArray(newItinerary.days) ||
      newItinerary.days.length !== tripDays
    ) {
      return res.status(502).json({
        success: false,
        message: "Gemini returned an incorrect number of itinerary days",
      });
    }

    const normalized = normalizeItinerary(newItinerary);

    const updatedItinerary = await Itinerary.findOneAndUpdate(
      { trip: tripId },
      {
        estimatedTotalCost: normalized.estimatedTotalCost,
        days: normalized.days,

        $push: {
          replanHistory: {
            instruction: instruction.trim(),
            createdAt: new Date(),
            itinerary: previousItinerarySnapshot,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Trip re-planned successfully",
      itinerary: updatedItinerary,
    });
  } catch (error) {
    console.error("Re-plan itinerary error:", error);

    const status = getErrorStatus(error);

    if ([429, 500, 502, 503, 504].includes(Number(status))) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is temporarily busy. Please try re-planning again in a moment.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to re-plan itinerary",
    });
  }
};

module.exports = {
  generateItinerary,
  replanItinerary,
};