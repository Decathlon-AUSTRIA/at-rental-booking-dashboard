// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Workshops from "./pages/Workshops";
import Rental from "./pages/Rental";
import RentalBikes from "./pages/RentalBikes";
import RentalBookings from "./pages/RentalBookings";
import Login from "./pages/Login";
import UserNotAllowed from "./pages/UserNotAllowed";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Define the allowed email addresses
  const allowedEmails = [
    "allowed@example.com",
    "employee@yourcompany.com",
    "hadar.acobas@decathlon.com",
  ];
  // Check if the authenticated user's email is in the allowed list

  // const isUserAllowed = isAuthenticated && user && allowedEmails.includes(user.email);
  const isUserAllowed = isAuthenticated && user;

  return (
    <Router>
      {/* Only show the Header if the user is authenticated and allowed */}
      {isAuthenticated && isUserAllowed && <Header />}
      <Routes>
        {/* When not authenticated */}
        {!isAuthenticated && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* When authenticated but not allowed */}
        {isAuthenticated && !isUserAllowed && (
          <>
            <Route path="/user-not-allowed" element={<UserNotAllowed />} />
            <Route
              path="*"
              element={<Navigate to="/user-not-allowed" replace />}
            />
          </>
        )}

        {/* When authenticated and allowed */}
        {isAuthenticated && isUserAllowed && (
          <>
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/rental" element={<Rental />} />
            <Route path="/rental-bikes" element={<RentalBikes />} />
            <Route path="/rental-bookings" element={<RentalBookings />} />
            <Route
              path="*"
              element={<Navigate to="/rental-bookings" replace />}
            />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
