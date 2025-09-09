/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  useTheme,
  Fab
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

// Import tab components
import InfrastructureTab from "./Tabs/InfrastructureTab";

// Import the hook
import useGoogleMapWithIndia from "../hooks/useGoogleMapWithIndia";

export default function AddInfra() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Back button
  const handleBack = () => navigate("/network");

  // Use Google Maps hook
  const { mapRef, map, loaded, error } = useGoogleMapWithIndia({
    apiKey: "AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ"
  });

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row", // Sidebar + Map
        bgcolor: "#fafafa",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: sidebarOpen ? { xs: "100%", md: 400, lg: 480 } : 0,
          minWidth: sidebarOpen ? { md: 320 } : 0,
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: "white",
          borderRight: sidebarOpen ? "1px solid rgba(0,0,0,0.1)" : "none",
          boxShadow: sidebarOpen ? "2px 0 10px rgba(0,0,0,0.04)" : "none",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.4s ease"
        }}
      >
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1,
                py: 0.5,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                backgroundColor: "white"
              }}
            >
              <IconButton
                size="small"
                color="primary"
                onClick={handleBack}
                disableRipple
                sx={{
                  "&:focus": { outline: "none" },
                  "&:hover": { backgroundColor: "rgba(25,118,210,0.1)" }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, ml: 1, flex: 1 }}
              >
                Tools
              </Typography>
              {/* Close button */}
              <IconButton
                size="small"
                onClick={() => setSidebarOpen(false)}
                disableRipple
                sx={{
                  color: "red",
                  "&:focus": { outline: "none" },
                  "&:hover": { backgroundColor: "rgba(255,0,0,0.1)" }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Progress Bar */}
            <Box
              sx={{
                height: 4,
                background: "linear-gradient(90deg, #667eea, #764ba2)"
              }}
            />

            {/* Controls Content */}
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                  borderRadius: 3
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(25,118,210,0.2)",
                  borderRadius: 3,
                  "&:hover": { backgroundColor: "rgba(25,118,210,0.3)" }
                }
              }}
            >
              <InfrastructureTab map={map} />
            </Box>
          </>
        )}
      </Paper>

      {/* Map Container */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          backgroundColor: "white"
        }}
      >
        {/* Toggle Button (when sidebar closed) */}
        {!sidebarOpen && (
          <Fab
            color="primary"
            size="medium"
            onClick={() => setSidebarOpen(true)}
            disableRipple
            sx={{
              position: "absolute",
              top: 9,
              left: 190,
              zIndex: 20,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
              "&:focus": { outline: "none" }
            }}
          >
            <MenuIcon />
          </Fab>
        )}

        {/* Loading Spinner */}
        {!loaded && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.9)",
              zIndex: 10
            }}
          >
            Loading Google Maps...
          </Box>
        )}

        {/* Google Map */}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {error && (
          <Typography
            color="error"
            sx={{ position: "absolute", top: 10, left: 10 }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
