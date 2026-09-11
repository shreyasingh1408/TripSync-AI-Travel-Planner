import { useState } from "react";
import { Link } from "react-router-dom";

function CreateTrip() {
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

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle trip type
  const handleTripType = (type) => {
    setFormData({
      ...formData,
      tripType: type,
    });
  };

  // Handle preferences
  const handlePreference = (preference) => {
    const alreadySelected =
      formData.preferences.includes(preference);

    if (alreadySelected) {
      setFormData({
        ...formData,
        preferences: formData.preferences.filter(
          (item) => item !== preference
        ),
      });
    } else {
      setFormData({
        ...formData,
        preferences: [
          ...formData.preferences,
          preference,
        ],
      });
    }
  };

  // Create Trip
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Get JWT token
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first!");
        return;
      }

      // Convert frontend trip type
      // Friends -> group
      const backendTripType =
        formData.tripType === "Friends"
          ? "group"
          : formData.tripType.toLowerCase();

      // Data required by backend
      const tripData = {
        destination: formData.destination,

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

      // API request
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

      // Handle error
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create trip"
        );
      }

      // Success
      alert(
        `Trip created successfully! 🎉\n\nJoin Code: ${data.trip.joinCode}`
      );

      console.log("Created Trip:", data.trip);

    } catch (error) {
      console.error("Create trip error:", error);

      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">

        <Link
          to="/"
          className="text-2xl font-bold"
        >
          TripSync
        </Link>

        <Link
          to="/dashboard"
          className="text-slate-400 hover:text-white"
        >
          ← Dashboard
        </Link>

      </nav>


      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold">
            Create Your Trip ✈️
          </h2>

          <p className="text-slate-400 mt-2">
            Tell us about your trip and we'll help you plan it.
          </p>
        </div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* Destination */}
          <div>

            <label className="block mb-2 font-medium">
              Destination
            </label>

            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g. Manali"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
            />

          </div>


          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Start Date */}
            <div>

              <label className="block mb-2 font-medium">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
              />

            </div>


            {/* End Date */}
            <div>

              <label className="block mb-2 font-medium">
                End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
              />

            </div>

          </div>


          {/* Trip Type */}
          <div>

            <label className="block mb-3 font-medium">
              Trip Type
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {[
                "Solo",
                "Couple",
                "Family",
                "Friends",
              ].map((type) => (

                <button
                  type="button"
                  key={type}
                  onClick={() =>
                    handleTripType(type)
                  }
                  className={`py-3 rounded-xl border transition ${
                    formData.tripType === type
                      ? "border-blue-500 bg-blue-600"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800"
                  }`}
                >

                  {formData.tripType === type && (
                    <span className="mr-2">
                      ✓
                    </span>
                  )}

                  {type}

                </button>

              ))}

            </div>

          </div>


          {/* Travellers */}
          <div>

            <label className="block mb-2 font-medium">
              Number of Travellers
            </label>

            <input
              type="number"
              name="travellers"
              value={formData.travellers}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
            />

          </div>


          {/* Budget */}
          <div>

            <label className="block mb-2 font-medium">
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
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
            />

          </div>


          {/* Preferences */}
          <div>

            <label className="block mb-3 font-medium">
              What do you enjoy?
            </label>

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
                    className={`p-3 rounded-xl border text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-600"
                        : "border-slate-700 bg-slate-900 hover:bg-slate-800"
                    }`}
                  >

                    {selected && (
                      <span className="mr-2">
                        ✓
                      </span>
                    )}

                    {item}

                  </button>

                );
              })}

            </div>

          </div>


          {/* Trip Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <h3 className="font-semibold mb-3">
              Trip Summary
            </h3>

            <div className="space-y-2 text-sm text-slate-400">

              <p>
                <span className="text-white">
                  Destination:
                </span>{" "}
                {formData.destination || "Not selected"}
              </p>

              <p>
                <span className="text-white">
                  Start Date:
                </span>{" "}
                {formData.startDate || "Not selected"}
              </p>

              <p>
                <span className="text-white">
                  End Date:
                </span>{" "}
                {formData.endDate || "Not selected"}
              </p>

              <p>
                <span className="text-white">
                  Trip Type:
                </span>{" "}
                {formData.tripType}
              </p>

              <p>
                <span className="text-white">
                  Travellers:
                </span>{" "}
                {formData.travellers}
              </p>

              <p>
                <span className="text-white">
                  Budget:
                </span>{" "}
                {formData.budget
                  ? `₹${formData.budget}`
                  : "Not selected"}
              </p>

              <p>
                <span className="text-white">
                  Preferences:
                </span>{" "}
                {formData.preferences.length > 0
                  ? formData.preferences.join(", ")
                  : "None selected"}
              </p>

            </div>

          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Creating Trip..."
              : "Create Trip →"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default CreateTrip;