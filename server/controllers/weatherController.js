const axios = require("axios");
const mongoose = require("mongoose");
const Trip = require("../models/Trip");

const getWeather = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Validate trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    // Check that the logged-in user has access to the trip
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

    // Check API key
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Weather API key is not configured",
      });
    }

    // Number of days for the trip
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    const tripDays =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    // WeatherAPI forecast supports a limited forecast range.
    // We request up to 14 days.
    const forecastDays = Math.min(Math.max(tripDays, 1), 14);

    // Fetch weather
    const response = await axios.get(
      "https://api.weatherapi.com/v1/forecast.json",
      {
        params: {
          key: apiKey,
          q: trip.destination,
          days: forecastDays,
          aqi: "no",
          alerts: "yes",
        },
      }
    );

    const weatherData = response.data;

    // Format location
    const location = {
      name: weatherData.location?.name || "",
      region: weatherData.location?.region || "",
      country: weatherData.location?.country || "",
    };

    // Format forecast
    const forecast =
      weatherData.forecast?.forecastday?.map((day) => ({
        date: day.date,

        condition:
          day.day?.condition?.text || "",

        conditionIcon:
          day.day?.condition?.icon || "",

        maxTempC:
          day.day?.maxtemp_c ?? null,

        minTempC:
          day.day?.mintemp_c ?? null,

        rainChance:
          day.day?.daily_chance_of_rain ?? 0,

        totalPrecipMm:
          day.day?.totalprecip_mm ?? 0,

        maxWindKph:
          day.day?.maxwind_kph ?? 0,

        sunrise:
          day.astro?.sunrise || "",

        sunset:
          day.astro?.sunset || "",
      })) || [];

    // Format weather alerts
    const alerts =
      weatherData.alerts?.alert?.map((alert) => ({
        headline: alert.headline || "Weather Alert",
        desc: alert.desc || "",
      })) || [];

    res.status(200).json({
      success: true,
      location,
      forecast,
      alerts,
    });
  } catch (error) {
    console.error(
      "Weather error:",
      error.response?.data || error.message
    );

    const apiMessage =
      error.response?.data?.error?.message;

    res.status(error.response?.status || 500).json({
      success: false,
      message:
        apiMessage || "Failed to fetch weather forecast",
    });
  }
};

module.exports = {
  getWeather,
};