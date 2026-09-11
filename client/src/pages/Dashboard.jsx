
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch trips"
        );
      }

      setTrips(data.trips || []);
    } catch (error) {
      console.error("Fetch trips error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete trip
  const handleDelete = async (tripId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/trips/${tripId}`,
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

      // Remove from UI
      setTrips(
        trips.filter((trip) => trip._id !== tripId)
      );
    } catch (error) {
      alert(error.message);
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

        <div className="flex items-center gap-4">

          <span className="hidden md:block text-slate-400">
            Welcome 👋
          </span>

          <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">
            Profile
          </button>

        </div>
      </nav>


      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>
            <h2 className="text-3xl font-bold">
              Your Trips
            </h2>

            <p className="text-slate-400 mt-2">
              Plan, manage and enjoy your journeys.
            </p>
          </div>

          {/* Create + Join Buttons */}
          <div className="flex gap-3">

            <Link
              to="/join-trip"
              className="px-6 py-3 bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 transition text-center"
            >
              Join Trip
            </Link>

            <Link
              to="/create-trip"
              className="px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition text-center"
            >
              + Create Trip
            </Link>

          </div>

        </div>


        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
            {error}
          </div>
        )}


        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Total Trips
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {trips.length}
            </h3>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Upcoming Trips
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {
                trips.filter(
                  (trip) =>
                    new Date(trip.startDate) >=
                    new Date()
                ).length
              }
            </h3>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Completed Trips
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {
                trips.filter(
                  (trip) =>
                    new Date(trip.endDate) <
                    new Date()
                ).length
              }
            </h3>

          </div>

        </section>


        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-slate-400">
            Loading your trips...
          </div>
        )}


        {/* Trips */}
        {!loading && trips.length > 0 && (

          <section>

            <h3 className="text-2xl font-bold mb-6">
              Your Trips ✈️
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              {trips.map((trip) => (

                <div
                  key={trip._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition"
                >

                  {/* Trip Header */}
                  <div className="flex justify-between items-start">

                    <div>

                      <h4 className="text-2xl font-bold">
                        {trip.destination}
                      </h4>

                      <p className="text-slate-400 mt-1">
                        {trip.tripType}
                      </p>
                    </div>

                    <span className="text-3xl">
                      ✈️
                    </span>

                  </div>


                  {/* Dates */}
                  <div className="mt-5 space-y-2 text-sm">

                    <p className="text-slate-400">

                      📅{" "}

                      <span className="text-white">
                        {new Date(
                          trip.startDate
                        ).toLocaleDateString()}
                      </span>

                      {" → "}

                      <span className="text-white">
                        {new Date(
                          trip.endDate
                        ).toLocaleDateString()}
                      </span>

                    </p>


                    <p className="text-slate-400">

                      👥{" "}

                      <span className="text-white">
                        {trip.travellers} travellers
                      </span>

                    </p>


                    <p className="text-slate-400">

                      💰{" "}

                      <span className="text-white">
                        ₹{trip.budget}
                      </span>

                    </p>

                  </div>


                  {/* Join Code */}
                  <div className="mt-5 p-3 bg-slate-800 rounded-lg">

                    <p className="text-xs text-slate-400">
                      Trip Join Code
                    </p>

                    <p className="font-bold tracking-widest mt-1">
                      {trip.joinCode}
                    </p>

                  </div>


                  {/* Actions */}
                  <div className="flex gap-3 mt-5">

                    <Link
                      to={`/trip/${trip._id}`}
                      className="flex-1 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-center"
                    >
                      View Trip
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(trip._id)
                      }
                      className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* Empty State */}
        {!loading && trips.length === 0 && !error && (

          <section className="border border-dashed border-slate-700 rounded-2xl p-10 md:p-16 text-center">

            <div className="text-6xl mb-5">
              ✈️
            </div>

            <h3 className="text-2xl font-semibold">
              No trips yet
            </h3>

            <p className="text-slate-400 mt-3 max-w-md mx-auto">
              Start planning your first adventure
              with TripSync.
            </p>

            <div className="flex justify-center gap-3 mt-7">

              <Link
                to="/join-trip"
                className="px-6 py-3 bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700"
              >
                Join a Trip
              </Link>

              <Link
                to="/create-trip"
                className="px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700"
              >
                Create Your First Trip
              </Link>

            </div>

          </section>

        )}


        {/* Features */}
        <section className="mt-12">

          <h3 className="text-2xl font-bold mb-6">
            TripSync Features
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="text-3xl mb-4">
                🤖
              </div>

              <h4 className="font-semibold">
                AI Itinerary
              </h4>

              <p className="text-slate-400 text-sm mt-2">
                Generate personalized travel plans
                using AI.
              </p>

            </div>


            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="text-3xl mb-4">
                🗺️
              </div>

              <h4 className="font-semibold">
                Smart Maps
              </h4>

              <p className="text-slate-400 text-sm mt-2">
                Explore places and organize your
                destinations.
              </p>

            </div>


            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="text-3xl mb-4">
                🌦️
              </div>

              <h4 className="font-semibold">
                Weather
              </h4>

              <p className="text-slate-400 text-sm mt-2">
                Check weather before planning
                activities.
              </p>

            </div>


            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="text-3xl mb-4">
                👥
              </div>

              <h4 className="font-semibold">
                Collaboration
              </h4>

              <p className="text-slate-400 text-sm mt-2">
                Plan with friends and family.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;

