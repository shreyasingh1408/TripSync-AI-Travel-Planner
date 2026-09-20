\# TripSync — AI Travel Planner



TripSync is a full-stack AI-powered travel planning application that helps users create personalized trips, generate day-by-day itineraries, check destination weather, manage traveller preferences, and modify plans using natural-language instructions.



\## Features



\- 🔐 JWT-based authentication

\- 🗺️ Trip creation and management

\- 👥 Traveller/member preference management

\- 🔑 Trip join codes

\- 🤖 AI-generated personalized itineraries using Google Gemini

\- 🔄 Natural-language AI itinerary re-planning

\- 📜 Re-planning history

\- 🌦️ Weather forecasts and weather alerts

\- 💰 Budget-aware itinerary planning

\- 📱 Responsive modern React UI



\## Tech Stack



\### Frontend

\- React

\- Vite

\- React Router

\- Tailwind CSS

\- Fetch API



\### Backend

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT

\- bcryptjs



\### APIs

\- Google Gemini API

\- WeatherAPI



\## Project Structure



```text

TripSync/

├── client/

│   ├── src/

│   │   ├── pages/

│   │   ├── components/

│   │   ├── App.jsx

│   │   └── main.jsx

│   ├── package.json

│   └── vite.config.js

│

├── server/

│   ├── controllers/

│   ├── models/

│   ├── routes/

│   ├── middleware/

│   ├── server.js

│   └── package.json

│

├── .gitignore

├── README.md

└── server/.env.example

