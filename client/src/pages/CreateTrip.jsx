import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "Friends",
    travellers: 2,
    budget: "",
    preferences: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preferencesList = [
    "Adventure",
    "Nature",
    "Food",
    "Culture",
    "Shopping",
    "Relaxation",
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Handle trip type
  const handleTripType = (type) => {
    setFormData((prev) => ({
      ...prev,
      tripType: type,
    }));

    setError("");
  };

  // Handle preferences
  const handlePreference = (preference) => {
    setFormData((prev) => {
      const alreadySelected =
        prev.preferences.includes(preference);

      return {
        ...prev,
        preferences: alreadySelected
          ? prev.preferences.filter(
              (item) => item !== preference
            )
          : [...prev.preferences, preference],
      };
    });
  };

  // Create Trip
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Please select start and end dates.");
      return;
    }

    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      setError("End date cannot be before start date.");
      return;
    }

    if (Number(formData.travellers) < 1) {
      setError("Travellers must be at least 1.");
      return;
    }

    if (
      formData.budget === "" ||
      Number(formData.budget) < 0
    ) {
      setError("Please enter a valid budget.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      // Friends -> group
      const backendTripType =
        formData.tripType === "Friends"
          ? "group"
          : formData.tripType.toLowerCase();

      const tripData = {
        destination: formData.destination.trim(),

        startDate: formData.startDate,

        endDate: formData.endDate,

        tripType: backendTripType,

        travellers: Number(formData.travellers),

        budget: Number(formData.budget),

        preferences: {
          interests: formData.preferences,

          food: "",

          walking: "",

          travelStyle: "",
        },
      };

      console.log("Sending Trip Data:", tripData);

      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(tripData),
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create trip"
        );
      }

      alert(
        `Trip created successfully! 🎉\n\nJoin Code: ${data.trip.joinCode}`
      );

      navigate(`/trip/${data.trip._id}`);

    } catch (error) {
      console.error("Create trip error:", error);

      setError(
        error.message || "Something went wrong while creating the trip."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight hover:text-blue-400 transition"
          >
            TripSync
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>


      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-10">

        {/* Page Heading */}
        <div className="mb-10">

          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-2">
            New Journey
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Create Your Trip ✈️
          </h1>

          <p className="text-slate-400 mt-3 max-w-xl">
            Tell us about your trip and TripSync will use your
            preferences to help build a personalized itinerary.
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl
                          bg-red-500/10
                          border border-red-500/30
                          text-red-400">

            <div className="flex items-center gap-3">
              <span>⚠️</span>
              <p>{error}</p>
            </div>

          </div>
        )}


        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60
                     border border-slate-800
                     rounded-3xl
                     p-6 md:p-8
                     space-y-8"
        >

          {/* Basic Trip Details */}
          <section>

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl
                              bg-blue-500/10
                              border border-blue-500/20
                              flex items-center justify-center">
                📍
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Trip Details
                </h2>

                <p className="text-sm text-slate-500">
                  Where and when are you travelling?
                </p>
              </div>

            </div>


            {/* Destination */}
            <div className="mb-5">

              <label className="block text-sm font-medium mb-2">
                Destination
              </label>

              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Manali"
                required
                className="w-full px-4 py-3.5
                           bg-slate-950
                           border border-slate-700
                           rounded-xl
                           outline-none
                           placeholder:text-slate-600
                           focus:border-blue-500
                           focus:ring-2
                           focus:ring-blue-500/10
                           transition"
              />

            </div>


            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5
                             bg-slate-950
                             border border-slate-700
                             rounded-xl
                             outline-none
                             focus:border-blue-500
                             focus:ring-2
                             focus:ring-blue-500/10
                             transition"
                />

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5
                             bg-slate-950
                             border border-slate-700
                             rounded-xl
                             outline-none
                             focus:border-blue-500
                             focus:ring-2
                             focus:ring-blue-500/10
                             transition"
                />

              </div>

            </div>

          </section>


          {/* Trip Type */}
          <section className="pt-2">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl
                              bg-purple-500/10
                              border border-purple-500/20
                              flex items-center justify-center">
                👥
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Travel Group
                </h2>

                <p className="text-sm text-slate-500">
                  Who are you travelling with?
                </p>
              </div>

            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {[
                "Solo",
                "Couple",
                "Family",
                "Friends",
              ].map((type) => {

                const selected =
                  formData.tripType === type;

                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleTripType(type)}
                    className={`py-3.5 rounded-xl border
                                font-medium transition
                                ${
                                  selected
                                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                    : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                                }`}
                  >

                    {selected && (
                      <span className="mr-2">
                        ✓
                      </span>
                    )}

                    {type}

                  </button>
                );
              })}

            </div>

          </section>


          {/* Travellers + Budget */}
          <section className="pt-2">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl
                              bg-emerald-500/10
                              border border-emerald-500/20
                              flex items-center justify-center">
                💰
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Trip Planning
                </h2>

                <p className="text-sm text-slate-500">
                  Set your group size and approximate budget.
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Travellers */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Number of Travellers
                </label>

                <input
                  type="number"
                  name="travellers"
                  value={formData.travellers}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-3.5
                             bg-slate-950
                             border border-slate-700
                             rounded-xl
                             outline-none
                             focus:border-blue-500
                             focus:ring-2
                             focus:ring-blue-500/10
                             transition"
                />

              </div>


              {/* Budget */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Approximate Budget (₹)
                </label>

                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. 30000"
                  min="0"
                  required
                  className="w-full px-4 py-3.5
                             bg-slate-950
                             border border-slate-700
                             rounded-xl
                             outline-none
                             placeholder:text-slate-600
                             focus:border-blue-500
                             focus:ring-2
                             focus:ring-blue-500/10
                             transition"
                />

              </div>

            </div>

          </section>


          {/* Preferences */}
          <section className="pt-2">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl
                              bg-orange-500/10
                              border border-orange-500/20
                              flex items-center justify-center">
                ✨
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Travel Preferences
                </h2>

                <p className="text-sm text-slate-500">
                  Select the experiences you enjoy.
                </p>
              </div>

            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {preferencesList.map((item) => {

                const selected =
                  formData.preferences.includes(item);

                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      handlePreference(item)
                    }
                    className={`p-3.5 rounded-xl
                                border
                                text-left
                                font-medium
                                transition
                                ${
                                  selected
                                    ? "border-blue-500 bg-blue-600 text-white"
                                    : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                                }`}
                  >

                    <span
                      className={`inline-flex w-5 h-5 mr-2
                                  rounded-md
                                  items-center justify-center
                                  text-xs
                                  ${
                                    selected
                                      ? "bg-white/20"
                                      : "bg-slate-800"
                                  }`}
                    >
                      {selected ? "✓" : ""}
                    </span>

                    {item}

                  </button>
                );
              })}

            </div>

          </section>


          {/* Trip Summary */}
          <section
            className="rounded-2xl
                       bg-slate-950
                       border border-slate-800
                       p-6"
          >

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="font-semibold text-lg">
                  Trip Summary
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review your choices before creating the trip.
                </p>
              </div>

              <span className="text-xl">
                🧳
              </span>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">

              <div>
                <p className="text-slate-500">
                  Destination
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.destination || "Not selected"}
                </p>
              </div>


              <div>
                <p className="text-slate-500">
                  Trip Type
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.tripType}
                </p>
              </div>


              <div>
                <p className="text-slate-500">
                  Start Date
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.startDate || "Not selected"}
                </p>
              </div>


              <div>
                <p className="text-slate-500">
                  End Date
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.endDate || "Not selected"}
                </p>
              </div>


              <div>
                <p className="text-slate-500">
                  Travellers
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.travellers}
                </p>
              </div>


              <div>
                <p className="text-slate-500">
                  Budget
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.budget
                    ? `₹${Number(formData.budget).toLocaleString("en-IN")}`
                    : "Not selected"}
                </p>
              </div>


              <div className="md:col-span-2">

                <p className="text-slate-500">
                  Preferences
                </p>

                <p className="text-slate-200 mt-1">
                  {formData.preferences.length > 0
                    ? formData.preferences.join(", ")
                    : "None selected"}
                </p>

              </div>

            </div>

          </section>


          {/* Submit */}
          <div className="pt-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4
                         rounded-xl
                         bg-blue-600
                         font-semibold
                         text-lg
                         hover:bg-blue-500
                         transition
                         disabled:opacity-50
                         disabled:cursor-not-allowed
                         shadow-lg
                         shadow-blue-950/30"
            >
              {loading
                ? "Creating Trip..."
                : "Create Trip →"}
            </button>

            <p className="text-center text-xs text-slate-600 mt-3">
              Your trip will receive a unique join code after creation.
            </p>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreateTrip;