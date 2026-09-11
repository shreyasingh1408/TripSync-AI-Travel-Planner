import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function JoinTrip() {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleJoinTrip = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!joinCode.trim()) {
      setError("Please enter a trip join code.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/members/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            joinCode: joinCode.trim().toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to join trip"
        );
      }

      setSuccess("Trip joined successfully! 🎉");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Join trip error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          to="/dashboard"
          className="text-slate-400 hover:text-white transition"
        >
          ← Dashboard
        </Link>

      </nav>


      {/* Main */}
      <main className="flex items-center justify-center px-6 py-16">

        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

            {/* Icon */}
            <div className="text-center">

              <div className="text-5xl mb-4">
                🤝
              </div>

              <h1 className="text-3xl font-bold">
                Join a Trip
              </h1>

              <p className="text-slate-400 mt-2">
                Enter the join code shared by your
                trip creator.
              </p>

            </div>


            {/* Error */}
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}


            {/* Success */}
            {success && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {success}
              </div>
            )}


            {/* Form */}
            <form
              onSubmit={handleJoinTrip}
              className="mt-8"
            >

              <label className="block text-sm font-medium mb-2">
                Trip Join Code
              </label>

              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase())
                }
                placeholder="e.g. A7K9P2"
                maxLength={6}
                className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-center text-xl font-bold tracking-[0.3em] uppercase"
              />


              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3 bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Joining..." : "Join Trip"}
              </button>

            </form>


            {/* Help */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">

              <p className="text-sm text-slate-400">
                💡 Ask the trip creator for the
                <span className="text-white font-medium">
                  {" "}6-character join code
                </span>
                {" "}of the trip.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default JoinTrip;