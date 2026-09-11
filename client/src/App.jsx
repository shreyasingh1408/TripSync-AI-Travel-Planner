import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import TripDetails from "./pages/TripDetails";
import JoinTrip from "./pages/JoinTrip";
import EditTrip from "./pages/EditTrip";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/create-trip" element={<CreateTrip />} />

        <Route path="/trip/:id" element={<TripDetails />} />

        <Route path="/join-trip" element={<JoinTrip />} />

        <Route
  path="/edit-trip/:id"
  element={<EditTrip />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;