const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ===============================
// Routes
// ===============================

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const memberRoutes = require("./routes/memberRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const aiRoutes = require("./routes/aiRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

// ===============================
// App
// ===============================

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TripSync backend is running",
  });
});

// ===============================
// API Routes
// ===============================

// Authentication
app.use("/api/auth", authRoutes);

// Trips
app.use("/api/trips", tripRoutes);

// Members
app.use("/api/members", memberRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/itinerary", itineraryRoutes);


// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ===============================
// MongoDB Connection
// ===============================


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });