const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You can access this protected route",
    user: req.user,
  });
});

module.exports = router;