// src/pages/Workshops.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

const backendUrl = "http://localhost:8080"; // adjust as needed

// Define the list of workshops
const workshopList = [
  "Vösendorf",
  "Wien Stadlau",
  "Wien Columbus",
  "Klagenfurt",
  "Graz",
  "Linz",
];

const Workshops = () => {
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // Format: YYYY-MM-DD
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch bookings for the selected store when the store changes
  const fetchBookings = () => {
    if (!selectedStore) return;
    setLoading(true);
    fetch(
      `${backendUrl}/api/getBookings?store=${encodeURIComponent(selectedStore)}`
    )
      .then((res) => res.json())
      .then((data) => {
        // If a date is selected, filter bookings by date.
        const filteredBookings = selectedDate
          ? data.bookings.filter((b) => b.date === selectedDate)
          : data.bookings;
        setBookings(filteredBookings);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStore, selectedDate]);

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    fetch(`${backendUrl}/api/deleteBooking/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete success:", data);
        // Remove deleted booking from state
        setBookings((prevBookings) => prevBookings.filter((b) => b.id !== id));
      })
      .catch((err) => {
        console.error("Error deleting booking:", err);
      });
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <h1>Workshops Bookings</h1>

      {/* Workshop selection */}
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel id="store-select-label">Select Workshop</InputLabel>
        <Select
          labelId="store-select-label"
          value={selectedStore}
          label="Select Workshop"
          onChange={(e) => setSelectedStore(e.target.value)}
        >
          {workshopList.map((store) => (
            <MenuItem key={store} value={store}>
              {store}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date selection */}
      <TextField
        type="date"
        fullWidth
        label="Select Date"
        InputLabelProps={{ shrink: true }}
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time Slot</TableCell>
                <TableCell>Booking ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.hour}</TableCell>
                  <TableCell>{booking.bookingId}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Delete Booking
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Workshops;
