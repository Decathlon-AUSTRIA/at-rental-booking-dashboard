import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

//const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = "https://at-rental-booking.ew.r.appspot.com";

const RentalBookings = () => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [viewType, setViewType] = useState("all");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterUnit, setFilterUnit] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Format ISO → "DD.MM.YYYY HH:mm"
  const fmt = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        let url = `${BACKEND_URL}/api/getRentalBookings?viewType=${viewType}`;
        if (viewType === "daily" && selectedDate) {
          url += `&date=${selectedDate}`;
        } else if (viewType === "monthly" && selectedMonth) {
          url += `&date=${selectedMonth}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error fetching bookings data");
        const { bookings } = await res.json();
        // sort by createdAt desc
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(bookings);
      } catch (e) {
        console.error(e);
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (
      viewType === "all" ||
      (viewType === "daily" && selectedDate) ||
      (viewType === "monthly" && selectedMonth)
    ) {
      fetchBookings();
    }
  }, [viewType, selectedDate, selectedMonth]);

  const overallFiltered = bookings.filter((b) => {
    if (!filterUnit) return true;
    return (
      b.bikes?.some((bike) =>
        bike.unitId.toLowerCase().includes(filterUnit.toLowerCase())
      ) ?? false
    );
  });

  const pickups =
    viewType === "daily"
      ? overallFiltered.filter((b) => b.startDate === selectedDate)
      : viewType === "monthly"
      ? overallFiltered.filter((b) => b.startDate.startsWith(selectedMonth))
      : [];

  const returns =
    viewType === "daily"
      ? overallFiltered.filter((b) => b.endDate === selectedDate)
      : viewType === "monthly"
      ? overallFiltered.filter((b) => b.endDate.startsWith(selectedMonth))
      : [];

  const handleDelete = async (id) => {
    if (deletingId) return;
    if (!window.confirm("Diese Buchung wirklich löschen?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/deleteRentalBooking/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting booking");
      // re‐fetch
      let url = `${BACKEND_URL}/api/getRentalBookings?viewType=${viewType}`;
      if (viewType === "daily" && selectedDate) url += `&date=${selectedDate}`;
      else if (viewType === "monthly" && selectedMonth)
        url += `&date=${selectedMonth}`;
      const r2 = await fetch(url);
      const d2 = await r2.json();
      setBookings(d2.bookings || []);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const renderDateInput = () => {
    if (viewType === "daily") {
      return (
        <TextField
          label="Select Date"
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />
      );
    } else if (viewType === "monthly") {
      return (
        <TextField
          label="Select Month"
          type="month"
          size="small"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />
      );
    }
    return null;
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Rental Bookings Management
      </Typography>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 20,
          alignItems: "center",
          maxWidth: 600,
        }}
      >
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="view-type-label">Overview</InputLabel>
          <Select
            labelId="view-type-label"
            value={viewType}
            onChange={(e) => {
              setViewType(e.target.value);
              if (e.target.value === "all") {
                setSelectedDate("");
                setSelectedMonth("");
              }
            }}
            label="Overview"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
        {renderDateInput()}
        <TextField
          label="Filter by Unit ID"
          size="small"
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          sx={{ width: 160 }}
        />
      </div>

      <Typography variant="subtitle1">
        Total Bookings: {overallFiltered.length}
        {console.log("overallFiltered: ", overallFiltered)}
      </Typography>

      <Typography variant="h6" gutterBottom>
        Overall Bookings{" "}
        {viewType === "daily"
          ? `for ${selectedDate.split("-").reverse().join(".")}`
          : viewType === "monthly"
          ? `for ${selectedMonth}`
          : ""}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Created At</TableCell>
                <TableCell>Booking ID</TableCell>
                <TableCell># Bikes</TableCell>
                <TableCell>Unit IDs</TableCell>
                <TableCell>Total (€)</TableCell>
                <TableCell>Pickup Date</TableCell>
                <TableCell>Pickup Hour</TableCell>
                <TableCell>Return Date</TableCell>
                <TableCell>Return Hour</TableCell>
                <TableCell>Sportlerpass</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overallFiltered.map((b) => (
                <TableRow key={b.bookingId}>
                  <TableCell>{fmt(b.createdAt)}</TableCell>
                  <TableCell>{b.bookingId}</TableCell>
                  <TableCell>{b.bikes?.length || 0}</TableCell>
                  <TableCell>
                    {b.bikes?.map((x) => x.unitId).join(", ") || "–"}
                  </TableCell>
                  <TableCell>{b.totalPrice}€</TableCell>
                  <TableCell>
                    {b.startDate?.split("-").reverse().join(".")}
                  </TableCell>
                  <TableCell>{b.startHour}</TableCell>
                  <TableCell>
                    {b.endDate?.split("-").reverse().join(".")}
                  </TableCell>
                  <TableCell>{b.endHour}</TableCell>
                  <TableCell>{b.sportlerpass}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDelete(b.bookingId)}
                      disabled={deletingId === b.bookingId}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {overallFiltered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {viewType !== "all" && (
        <>
          <Typography variant="h6" gutterBottom>
            Pickups{" "}
            {viewType === "daily"
              ? `for ${selectedDate.split("-").reverse().join(".")}`
              : `for ${selectedMonth}`}
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell># Bikes</TableCell>
                    <TableCell>Total (€)</TableCell>
                    <TableCell>Start Hour</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pickups.map((b) => (
                    <TableRow key={b.bookingId}>
                      <TableCell>{b.bookingId}</TableCell>
                      <TableCell>{b.bikes?.length || 0}</TableCell>
                      <TableCell>{b.totalPrice}€</TableCell>
                      <TableCell>{b.startHour}</TableCell>
                    </TableRow>
                  ))}
                  {pickups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No pickups.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="h6" gutterBottom>
            Returns{" "}
            {viewType === "daily"
              ? `for ${selectedDate.split("-").reverse().join(".")}`
              : `for ${selectedMonth}`}
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell># Bikes</TableCell>
                    <TableCell>Total (€)</TableCell>
                    <TableCell>End Hour</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returns.map((b) => (
                    <TableRow key={b.bookingId}>
                      <TableCell>{b.bookingId}</TableCell>
                      <TableCell>{b.bikes?.length || 0}</TableCell>
                      <TableCell>{b.totalPrice}€</TableCell>
                      <TableCell>{b.endHour}</TableCell>
                    </TableRow>
                  ))}
                  {returns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No returns.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </div>
  );
};

export default RentalBookings;
