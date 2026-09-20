
# TripSync — AI Travel Planner

TripSync is a full-stack AI-powered travel planning application that helps users create personalized trips, generate multi-day itineraries, check destination weather, manage traveller preferences, and modify travel plans using natural-language instructions.

## ✨ Features

- 🔐 User authentication with JWT
- ✈️ Create, edit, and delete trips
- 🔑 Unique trip join codes
- 👥 Traveller/member preference management
- 🤖 AI-powered itinerary generation using Gemini
- 🔄 Natural-language AI itinerary re-planning
- 🕘 Re-plan history for previous itineraries
- 🌦️ Destination weather forecasts
- 💰 Budget-aware itinerary cost estimation
- 📅 Multi-day itinerary planning
- 📱 Responsive dark-themed React UI

---

## 🛠️ Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Vite
- Fetch API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI & External APIs
- Google Gemini API
- WeatherAPI

---

## 🏗️ Project Architecture

```text
TripSync/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── memberController.js
│   │   ├── tripController.js
│   │   ├── weatherController.js
│   │   └── itineraryController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Trip.js
│   │   ├── Member.js
│   │   └── Itinerary.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── weatherRoutes.js
│   │   └── itineraryRoutes.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md