
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const [copied, setCopied] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [newMember, setNewMember] = useState({
    name: "",
    ageGroup: "adult",
    food: "",
    walking: "",
  });

  // =====================================================
  // FETCH TRIP
  // =====================================================

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch(
        `http://localhost:5000/api/trips/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch trip"
        );
      }

      setTrip(data.trip);
    } catch (error) {
      console.error("Fetch trip error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH EXISTING ITINERARY
  // =====================================================

  const fetchItinerary = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `http://localhost:5000/api/itinerary/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setItinerary(data.itinerary || null);
      }
    } catch (error) {
      console.error("Fetch itinerary error:", error);
    }
  };

  // =====================================================
  // FETCH WEATHER
  // =====================================================

  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch(
        `http://localhost:5000/api/weather/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch weather"
        );
      }

      setWeather(data);
    } catch (error) {
      console.error("Fetch weather error:", error);
      setWeatherError(error.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  // =====================================================
  // GENERATE AI ITINERARY
  // =====================================================

  const generateAIItinerary = async () => {
    try {
      setGenerating(true);
      setAiError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch(
        "http://localhost:5000/api/ai/generate-itinerary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tripId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate itinerary"
        );
      }

      setItinerary(data.itinerary);
    } catch (error) {
      console.error("AI itinerary error:", error);
      setAiError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  // =====================================================
  // DELETE TRIP
  // =====================================================

  const handleDeleteTrip = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/trips/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete trip"
        );
      }

      alert("Trip deleted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Delete trip error:", error);
      setError(error.message);
    }
  };

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!newMember.name.trim()) {
      setError("Please enter member name.");
      return;
    }

    try {
      setAddingMember(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/members/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newMember.name.trim(),
            ageGroup: newMember.ageGroup,
            food: newMember.food,
            walking: newMember.walking,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add member"
        );
      }

      setTrip(data.trip);

      setNewMember({
        name: "",
        ageGroup: "adult",
        food: "",
        walking: "",
      });

      setShowAddMember(false);
    } catch (error) {
      console.error("Add member error:", error);
      setError(error.message);
    } finally {
      setAddingMember(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchTrip();
    fetchItinerary();
    fetchWeather();
  }, [id]);

  // =====================================================
  // COPY JOIN CODE
  // =====================================================

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(trip.joinCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // TRIP DAYS
  // =====================================================

  const getTripDays = () => {
    if (!trip) return 0;

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    const difference = end.getTime() - start.getTime();

    return (
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pulse">
            ✈️
          </div>

          <p className="text-slate-400 mt-5">
            Loading your trip...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl">😕</div>

          <h2 className="text-2xl font-bold mt-5">
            Unable to load trip
          </h2>

          <p className="text-red-400 mt-3">
            {error}
          </p>

          <Link
            to="/dashboard"
            className="inline-block mt-7 px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-2xl font-bold"
          >
            Trip
            <span className="text-blue-500">
              Sync
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-slate-800 rounded-xl hover:bg-slate-700"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="bg-gradient-to-br from-blue-600/20 via-slate-900 to-purple-600/20 border border-slate-800 rounded-3xl p-7 md:p-10">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
            <div>
              <span className="inline-flex px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm capitalize">
                {trip.tripType} Trip
              </span>

              <h1 className="text-4xl md:text-5xl font-bold mt-5">
                {trip.destination}
              </h1>

              <p className="text-slate-400 mt-4 text-lg">
                {formatDate(trip.startDate)}

                <span className="mx-2">→</span>

                {formatDate(trip.endDate)}
              </p>

              <p className="text-slate-500 mt-2">
                {getTripDays()} day
                {getTripDays() !== 1 ? "s" : ""}
                {" "}adventure
              </p>
            </div>

            {/* JOIN CODE */}

            <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-6 w-full lg:w-72">
              <p className="text-xs text-slate-500 font-semibold">
                TRIP JOIN CODE
              </p>

              <p className="text-3xl font-bold tracking-[0.3em] mt-3">
                {trip.joinCode}
              </p>

              <button
                onClick={copyJoinCode}
                className="mt-4 w-full py-2.5 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700"
              >
                {copied ? "✓ Copied!" : "Copy Join Code"}
              </button>

              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to={`/edit-trip/${id}`}
                  className="w-full text-center px-5 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  ✏️ Edit Trip
                </Link>

                <button
                  onClick={handleDeleteTrip}
                  className="w-full px-5 py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition"
                >
                  🗑️ Delete Trip
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 text-sm">
              Travellers
            </p>

            <p className="text-3xl font-bold mt-2">
              {trip.travellers}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 text-sm">
              Members
            </p>

            <p className="text-3xl font-bold mt-2">
              {trip.members?.length || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 text-sm">
              Budget
            </p>

            <p className="text-3xl font-bold mt-2">
              ₹{trip.budget}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 text-sm">
              Duration
            </p>

            <p className="text-3xl font-bold mt-2">
              {getTripDays()} Days
            </p>
          </div>
        </section>

        {/* =================================================
            WEATHER
        ================================================= */}

        <section className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-cyan-400 text-sm font-semibold">
                TRIP WEATHER
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Weather Forecast 🌤️
              </h2>

              {weather?.location && (
                <p className="text-slate-400 text-sm mt-2">
                  {weather.location.name}
                  {weather.location.region
                    ? `, ${weather.location.region}`
                    : ""}
                  {weather.location.country
                    ? `, ${weather.location.country}`
                    : ""}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={fetchWeather}
              disabled={weatherLoading}
              className="px-5 py-2.5 bg-cyan-600 rounded-xl font-semibold hover:bg-cyan-700 transition disabled:opacity-50"
            >
              {weatherLoading
                ? "Loading..."
                : "↻ Refresh Weather"}
            </button>
          </div>

          {weatherLoading ? (
            <div className="text-center py-12">
              <div className="text-5xl animate-pulse">
                🌦️
              </div>

              <p className="text-slate-400 mt-4">
                Fetching weather forecast...
              </p>
            </div>
          ) : weatherError ? (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">
                {weatherError}
              </p>

              <button
                type="button"
                onClick={fetchWeather}
                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 underline"
              >
                Try again
              </button>
            </div>
          ) : weather?.forecast?.length > 0 ? (
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weather.forecast.map((day) => (
                <div
                  key={day.date}
                  className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {new Date(
                        day.date
                      ).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>

                    {day.conditionIcon && (
                      <img
                        src={
                          day.conditionIcon.startsWith(
                            "//"
                          )
                            ? `https:${day.conditionIcon}`
                            : day.conditionIcon
                        }
                        alt={
                          day.condition ||
                          "Weather condition"
                        }
                        className="w-12 h-12"
                      />
                    )}
                  </div>

                  <p className="text-slate-300 text-sm mt-2">
                    {day.condition}
                  </p>

                  <div className="flex items-end gap-2 mt-5">
                    <span className="text-3xl font-bold">
                      {Math.round(day.maxTempC)}°
                    </span>

                    <span className="text-slate-500 mb-1">
                      / {Math.round(day.minTempC)}°C
                    </span>
                  </div>

                  <div className="space-y-2 mt-5 text-sm text-slate-400">
                    <div className="flex justify-between gap-2">
                      <span>🌧️ Rain chance</span>

                      <span className="text-white">
                        {day.rainChance}%
                      </span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span>💧 Precipitation</span>

                      <span className="text-white">
                        {day.totalPrecipMm} mm
                      </span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span>💨 Max wind</span>

                      <span className="text-white">
                        {day.maxWindKph} km/h
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 mt-5 pt-4 text-xs text-slate-500 space-y-1">
                    <p>
                      🌅 Sunrise: {day.sunrise}
                    </p>

                    <p>
                      🌇 Sunset: {day.sunset}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                No weather forecast available for this trip.
              </p>
            </div>
          )}

          {weather?.alerts?.length > 0 && (
            <div className="mt-6 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <h3 className="font-semibold text-yellow-400">
                Weather Alerts ⚠️
              </h3>

              <div className="mt-3 space-y-3">
                {weather.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="text-sm text-slate-300"
                  >
                    <p className="font-semibold">
                      {alert.headline ||
                        "Weather Alert"}
                    </p>

                    {alert.desc && (
                      <p className="text-slate-400 mt-1">
                        {alert.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            AI PLANNER
        ================================================= */}

        <section className="mt-10 relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-slate-900 to-blue-600/10 border border-purple-500/20 rounded-3xl p-7 md:p-9">
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-7">
            <div>
              <p className="text-purple-400 text-sm font-semibold">
                SMART TRAVEL
              </p>

              <h2 className="text-3xl font-bold mt-2">
                AI Trip Planner 🤖
              </h2>

              <p className="text-slate-400 mt-3 max-w-2xl">
                Generate a personalized itinerary using
                your destination, dates, budget and
                traveller preferences.
              </p>

              {aiError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {aiError}
                </div>
              )}
            </div>

            <button
              onClick={generateAIItinerary}
              disabled={generating}
              className={`px-7 py-3.5 rounded-xl font-semibold transition whitespace-nowrap ${
                generating
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {generating
                ? "🤖 Generating..."
                : itinerary
                ? "✨ Regenerate Plan"
                : "✨ Generate AI Plan"}
            </button>
          </div>
        </section>

        {/* =================================================
            ITINERARY
        ================================================= */}

        <section className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-semibold">
                YOUR JOURNEY
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Itinerary 🗓️
              </h2>
            </div>

            {itinerary && (
              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                AI Generated
              </span>
            )}
          </div>

          {generating ? (
            <div className="text-center py-16">
              <div className="text-6xl animate-pulse">
                🤖
              </div>

              <h3 className="text-xl font-bold mt-5">
                Creating your perfect trip...
              </h3>

              <p className="text-slate-500 mt-2">
                AI is considering your budget,
                preferences and trip dates.
              </p>
            </div>
          ) : !itinerary ? (
            <div className="mt-7 border border-dashed border-slate-700 rounded-2xl p-10 text-center">
              <div className="text-5xl">🗺️</div>

              <h3 className="font-bold text-xl mt-4">
                No itinerary yet
              </h3>

              <p className="text-slate-400 mt-2">
                Click "Generate AI Plan" above to
                create your personalized itinerary.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {itinerary.days?.map((day, dayIndex) => (
                <div
                  key={day.day || dayIndex}
                  className="border border-slate-800 rounded-2xl overflow-hidden"
                >
                  {/* DAY HEADER */}

                  <div className="bg-slate-800/70 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-blue-400 font-semibold">
                        Day {day.day}
                      </p>

                      <p className="text-slate-300 text-sm mt-1">
                        {formatDate(day.date)}
                      </p>
                    </div>

                    <div className="text-sm text-slate-400">
                      Estimated:
                      <span className="text-white font-semibold ml-1">
                        ₹{day.estimatedDayCost}
                      </span>
                    </div>
                  </div>

                  {/* ACTIVITIES */}

                  <div className="p-5 space-y-4">
                    {day.activities?.map(
                      (activity, activityIndex) => (
                        <div
                          key={activityIndex}
                          className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                              {activityIndex + 1}
                            </div>

                            <div className="flex-1">
                              <h3 className="text-lg font-bold">
                                {activity.name}
                              </h3>

                              <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
                                <span>
                                  🕐 {activity.time}
                                </span>

                                <span>
                                  📍 {activity.location}
                                </span>

                                <span>
                                  ⏱️ {activity.duration}
                                </span>

                                <span>
                                  💰 ₹{activity.estimatedCost}
                                </span>
                              </div>

                              <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                                {activity.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* TOTAL */}

              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-slate-400 text-sm">
                    Estimated Total Trip Cost
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    ₹{itinerary.estimatedTotalCost}
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  AI generated estimate
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            MEMBERS + PREFERENCES
        ================================================= */}

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          {/* MEMBERS SECTION */}

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Members 👥
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowAddMember(!showAddMember)
                }
                className="px-4 py-2 bg-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
              >
                {showAddMember
                  ? "Cancel"
                  : "+ Add Member"}
              </button>
            </div>

            {/* ADD MEMBER FORM */}

            {showAddMember && (
              <form
                onSubmit={handleAddMember}
                className="mt-6 p-4 bg-slate-800 rounded-2xl space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Member Name
                  </label>

                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter member name"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age Group
                  </label>

                  <select
                    value={newMember.ageGroup}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        ageGroup: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                  >
                    <option value="child">Child</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Food Preference
                  </label>

                  <select
                    value={newMember.food}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        food: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                  >
                    <option value="">
                      Select preference
                    </option>
                    <option value="veg">
                      Vegetarian
                    </option>
                    <option value="non-veg">
                      Non-Vegetarian
                    </option>
                    <option value="vegan">
                      Vegan
                    </option>
                    <option value="any">Any</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Walking Preference
                  </label>

                  <select
                    value={newMember.walking}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        walking: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                  >
                    <option value="">
                      Select walking level
                    </option>
                    <option value="low">Low</option>
                    <option value="medium">
                      Medium
                    </option>
                    <option value="high">High</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addingMember}
                  className="w-full py-3 bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {addingMember
                    ? "Adding..."
                    : "Add Member"}
                </button>
              </form>
            )}

            {/* MEMBERS LIST */}

            <div className="space-y-3 mt-6">
              {trip.members?.length > 0 ? (
                trip.members.map((member, index) => (
                  <div
                    key={member._id || index}
                    className="flex items-center gap-3 bg-slate-800 rounded-xl p-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                      👤
                    </div>

                    <div>
                      <p className="font-semibold">
                        {member.name}
                      </p>

                      <p className="text-xs text-slate-500 capitalize">
                        {member.ageGroup || "Adult"}
                      </p>
                    </div>

                    {index === 0 && (
                      <span className="ml-auto text-xs text-blue-400">
                        Creator
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  No members yet.
                </p>
              )}
            </div>
          </section>

          {/* PREFERENCES */}

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold">
              Preferences ⚙️
            </h2>

            <div className="space-y-5 mt-6">
              <div>
                <p className="text-xs text-slate-500">
                  Interests
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {trip.preferences?.interests?.length > 0 ? (
                    trip.preferences.interests.map(
                      (interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs capitalize"
                        >
                          {interest}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-sm text-slate-500">
                      Not specified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Food
                </p>

                <p className="capitalize mt-1">
                  {trip.preferences?.food ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Walking
                </p>

                <p className="capitalize mt-1">
                  {trip.preferences?.walking ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Travel Style
                </p>

                <p className="capitalize mt-1">
                  {trip.preferences?.travelStyle ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TripDetails;