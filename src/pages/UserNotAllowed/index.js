// src/pages/UserNotAllowed.jsx
import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const UserNotAllowed = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    // Log the user out and return them to the home page, or another location
    logout({ returnTo: window.location.origin });
  };

  return (
    <Container sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h3" sx={{ color: "#3643BA", mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        We're sorry, but your account is not authorized to access this
        management dashboard. Please contact your administrator if you believe
        this is an error.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogout}>
        Log Out
      </Button>
    </Container>
  );
};

export default UserNotAllowed;
