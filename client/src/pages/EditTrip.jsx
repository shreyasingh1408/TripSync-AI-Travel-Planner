import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "solo",
    travellers: 1,
    budget: "",
    interests: [],
    food: "",
    walking: "",
    travelStyle: "",
  });

  const interestsList = [
    "Nature",
    "Adventure",
    "History",
    "Culture",
    "Food",
    "Shopping",
    "Beaches",
    "Nightlife",
  ];

  // Fetch existing trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
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
          throw new Error(data.message || "Failed to load trip");
        }

        const trip = data.trip;

        setFormData({
          destination: trip.destination || "",
          startDate: trip.startDate
            ? trip.startDate.split("T")[0]
            : "",
          endDate: trip.endDate
            ? trip.endDate.split("T")[0]
            : "",
          tripType: trip.tripType || "solo",
          travellers: trip.travellers || 1,
          budget: trip.budget || "",
          interests: trip.preferences?.interests || [],
          food: trip.preferences?.food || "",
          walking: trip.preferences?.walking || "",
          travelStyle: trip.preferences?.travelStyle || "",
        });
      } catch (error) {
        console.error("Fetch trip error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, navigate]);

  // Handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle interests
  const handleInterestChange = (interest) => {
    setFormData((prev) => {
      const alreadySelected =
        prev.interests.includes(interest);

      return {
        ...prev,
        interests: alreadySelected
          ? prev.interests.filter(
              (item) => item !== interest
            )
          : [...prev.interests, interest],
      };
    });
  };

  // Submit
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

    if (Number(formData.budget) < 0) {
      setError("Budget cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/trips/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            destination: formData.destination.trim(),
            startDate: formData.startDate,
            endDate: formData.endDate,
            tripType: formData.tripType,
            travellers: Number(formData.travellers),
            budget: Number(formData.budget),

            preferences: {
              interests: formData.interests,
              food: formData.food,
              walking: formData.walking,
              travelStyle: formData.travelStyle,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update trip"
        );
      }

      alert("Trip updated successfully! 🎉");

      navigate(`/trip/${id}`);
    } catch (error) {
      console.error("Update trip error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 text-lg">
          Loading trip...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <Link
          to="/dashboard"
          className="text-2xl font-bold"
        >
          TripSync
        </Link>

        <Link
          to={`/trip/${id}`}
          className="text-slate-400 hover:text-white transition"
        >
          ← Back to Trip
        </Link>
      </nav>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Edit Trip ✏️
          </h1>

          <p className="text-slate-400 mt-2">
            Update your trip details and preferences.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* Basic Details */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Trip Details
            </h2>

            <div className="space-y-5">

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Destination
                </label>

                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g. Goa"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Trip Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trip Type
                </label>

                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
                >
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>

              {/* Travellers + Budget */}
              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Travellers
                  </label>

                  <input
                    type="number"
                    name="travellers"
                    min="1"
                    value={formData.travellers}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Budget (₹)
                  </label>

                  <input
                    type="number"
                    name="budget"
                    min="0"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 20000"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

              </div>

            </div>
          </section>

          {/* Preferences */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Preferences
            </h2>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Interests
              </label>

              <div className="flex flex-wrap gap-3">

                {interestsList.map((interest) => {
                  const selected =
                    formData.interests.includes(
                      interest
                    );

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        handleInterestChange(interest)
                      }
                      className={`px-4 py-2 rounded-xl border transition ${
                        selected
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* Food */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Food Preference
              </label>

              <select
                name="food"
                value={formData.food}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
              >
                <option value="">
                  Select food preference
                </option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="any">Any</option>
              </select>
            </div>

            {/* Walking */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Walking Preference
              </label>

              <select
                name="walking"
                value={formData.walking}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
              >
                <option value="">
                  Select walking level
                </option>
                <option value="low">
                  Low
                </option>
                <option value="medium">
                  Medium
                </option>
                <option value="high">
                  High
                </option>
              </select>
            </div>

            {/* Travel Style */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Travel Style
              </label>

              <select
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
              >
                <option value="">
                  Select travel style
                </option>
                <option value="relaxed">
                  Relaxed
                </option>
                <option value="balanced">
                  Balanced
                </option>
                <option value="packed">
                  Packed
                </option>
              </select>
            </div>

          </section>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">

            <Link
              to={`/trip/${id}`}
              className="flex-1 py-3 text-center bg-slate-800 border border-slate-700 rounded-xl font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}

export default EditTrip;