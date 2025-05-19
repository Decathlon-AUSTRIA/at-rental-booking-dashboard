import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";

//const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = "https://at-rental-booking.ew.r.appspot.com";

const RentalBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUnit, setFilterUnit] = useState("");
  const [filterAlgolia, setFilterAlgolia] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [bikeForm, setBikeForm] = useState({
    unitId: "",
    algoliaObjectId: "",
    pricePerDay: "",
    isActive: true,
  });

  // Fetch bikes
  const fetchBikes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/getRentalBikes`);
      if (!res.ok) throw new Error("Error fetching bikes");
      const { bikes } = await res.json();
      setBikes(bikes || []);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  // Filter
  const filteredBikes = bikes.filter(
    (b) =>
      b.unitId.toLowerCase().includes(filterUnit.toLowerCase()) &&
      b.algoliaObjectId.toLowerCase().includes(filterAlgolia.toLowerCase())
  );

  // Dialog handlers
  const handleOpenDialog = (bike = null) => {
    if (bike) {
      setEditingBike(bike);
      setBikeForm({
        unitId: bike.unitId,
        algoliaObjectId: bike.algoliaObjectId,
        pricePerDay: bike.pricePerDay,
        isActive: bike.isActive,
      });
    } else {
      setEditingBike(null);
      setBikeForm({
        unitId: "",
        algoliaObjectId: "",
        pricePerDay: "",
        isActive: true,
      });
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => setOpenDialog(false);
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBikeForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add / update
  const handleSubmitForm = async () => {
    try {
      const method = editingBike ? "PUT" : "POST";
      const url = editingBike
        ? `${BACKEND_URL}/api/updateRentalBike/${editingBike.id}`
        : `${BACKEND_URL}/api/addRentalBike`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bikeForm),
      });
      if (!res.ok) throw new Error("Error saving bike");
      handleCloseDialog();
      await fetchBikes();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  // Delete
  const handleDeleteBike = async (id) => {
    if (!window.confirm("Löschen?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/deleteRentalBike/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting bike");
      await fetchBikes();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (bike) => {
    try {
      // flip the flag
      const updated = { ...bike, isActive: !bike.isActive };
      const res = await fetch(
        `${BACKEND_URL}/api/updateRentalBike/${bike.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: updated.isActive }),
        }
      );
      if (!res.ok) throw new Error("Error toggling active");
      // reflect immediately
      setBikes((prev) =>
        prev.map((b) =>
          b.id === bike.id ? { ...b, isActive: updated.isActive } : b
        )
      );
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Rental Bikes Management
      </Typography>

      <Button
        variant="contained"
        sx={{
          backgroundColor: "#3643BA",
          "&:hover": { backgroundColor: "#323894" },
          mb: 2,
        }}
        onClick={() => handleOpenDialog()}
      >
        Add New Bike
      </Button>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Filter by Unit ID"
          size="small"
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
        />
        <TextField
          label="Filter by Algolia Object ID"
          size="small"
          value={filterAlgolia}
          onChange={(e) => setFilterAlgolia(e.target.value)}
        />
      </div>

      <Typography variant="subtitle1" gutterBottom>
        Total Bikes: {filteredBikes.length}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Unit ID</TableCell>
                <TableCell>Algolia Object ID</TableCell>
                <TableCell>Price per Day (€)</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBikes.map((bike) => (
                <TableRow key={bike.id}>
                  <TableCell>{bike.unitId}</TableCell>
                  <TableCell>{bike.algoliaObjectId}</TableCell>
                  <TableCell>{bike.pricePerDay}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!bike.isActive}
                          onChange={() => handleToggleActive(bike)}
                        />
                      }
                      label={bike.isActive ? "On" : "Off"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button onClick={() => handleOpenDialog(bike)}>Edit</Button>
                    <Button
                      color="error"
                      onClick={() => handleDeleteBike(bike.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBikes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No bikes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingBike ? "Edit Bike" : "Add New Bike"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Unit ID"
            name="unitId"
            value={bikeForm.unitId}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Algolia Object ID"
            name="algoliaObjectId"
            value={bikeForm.algoliaObjectId}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Price per Day"
            name="pricePerDay"
            type="number"
            value={bikeForm.pricePerDay}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={!!bikeForm.isActive}
                onChange={handleFormChange}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitForm}>
            {editingBike ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RentalBikes;
