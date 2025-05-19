// src/components/Header.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../LoginButton";
import LogoutButton from "../LogoutButton";

const menuItems = [
  { label: "Rental‑Bikes", to: "/rental-bikes" },
  { label: "Rental‑Bookings", to: "/rental-bookings" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleDrawer = () => setDrawerOpen((open) => !open);

  // On mobile, we render a Drawer.
  const drawerList = (
    <List>
      {menuItems.map(({ label, to }) => (
        <ListItem key={to} disablePadding onClick={toggleDrawer}>
          <ListItemButton>
            {/* wrap the entire ListItemButton in a RouterLink */}
            <RouterLink
              to={to}
              style={{
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <ListItemText primary={label} />
            </RouterLink>
          </ListItemButton>
        </ListItem>
      ))}
      <ListItem disablePadding onClick={toggleDrawer}>
        <ListItemButton>
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#3643BA" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Management Dashboard
          </Typography>

          {isMobile ? (
            <IconButton color="inherit" onClick={toggleDrawer}>
              ☰
            </IconButton>
          ) : (
            <>
              {menuItems.map(({ label, to }) => (
                <Button key={to} color="inherit">
                  {/* here too, wrap the label in a RouterLink */}
                  <RouterLink
                    to={to}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {label}
                  </RouterLink>
                </Button>
              ))}
              {isAuthenticated ? <LogoutButton /> : <LoginButton />}
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        {drawerList}
      </Drawer>
    </>
  );
}
