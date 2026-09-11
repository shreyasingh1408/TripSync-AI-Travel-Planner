import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <h1 className="text-2xl font-bold">
          TripSync
        </h1>

        <div className="flex gap-4">
  <Link
    to="/login"
    className="px-5 py-2 rounded-lg hover:bg-white/10"
  >
    Login
  </Link>

  <Link
    to="/signup"
    className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
  >
    Sign Up
  </Link>
</div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24">

        <p className="text-blue-400 font-semibold mb-4">
          PLAN • COLLABORATE • TRAVEL
        </p>

        <h2 className="text-5xl md:text-6xl font-bold max-w-4xl">
          Plan Your Perfect Trip,
          <span className="text-blue-500"> Together.</span>
        </h2>

        <p className="mt-6 text-slate-400 max-w-2xl text-lg">
          TripSync helps you plan trips with friends, family or
          travel partners with smart itineraries, maps, weather,
          voting and AI-powered suggestions.
        </p>

        <Link
  to="/signup"
  className="mt-8 px-8 py-3 bg-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-700"
>
  Start Planning →
</Link>

      </section>

      {/* Features */}
      <section className="grid md:grid-cols-4 gap-6 px-8 mt-24 pb-20 max-w-6xl mx-auto">

        <div className="p-6 bg-slate-900 rounded-2xl">
          <h3 className="text-xl font-semibold">🤖 AI Planning</h3>
          <p className="text-slate-400 mt-2">
            Get smart itinerary and travel suggestions.
          </p>
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl">
          <h3 className="text-xl font-semibold">🗺️ Smart Maps</h3>
          <p className="text-slate-400 mt-2">
            Explore and organize places on your trip.
          </p>
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl">
          <h3 className="text-xl font-semibold">🌦️ Weather</h3>
          <p className="text-slate-400 mt-2">
            Check weather and adjust your plans.
          </p>
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl">
          <h3 className="text-xl font-semibold">👥 Collaboration</h3>
          <p className="text-slate-400 mt-2">
            Vote, share ideas and plan together.
          </p>
        </div>

      </section>

    </div>
  );
}

export default Landing;