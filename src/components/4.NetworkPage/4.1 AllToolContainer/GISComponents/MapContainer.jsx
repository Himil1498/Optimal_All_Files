import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  ButtonGroup,
  Typography,
  Tooltip,
  Stack,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Toolbar,
  useTheme,
  alpha,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  ZoomIn,
  ZoomOut,
  MyLocation,
  Fullscreen,
  Home,
  Navigation
} from "@mui/icons-material";

const MapContainer = ({
  sidebarOpen,
  drawerWidth,
  darkMode,
  mapRef,
  map,
  loaded,
  error,
  currentCoords,
  setCurrentCoords,
  addNotification,
  quickActionsOpen,
  setQuickActionsOpen,
  quickActions
}) => {
  const theme = useTheme();
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  // ✅ Update map center and zoom when currentCoords changes
  useEffect(() => {
    if (map && loaded && currentCoords) {
      try {
        map.setCenter({ lat: currentCoords.lat, lng: currentCoords.lng });
        map.setZoom(currentCoords.zoom);
      } catch (err) {
        console.error("Error updating map:", err);
        setMapError("Failed to update map position");
      }
    }
  }, [map, loaded, currentCoords]);

  // ✅ Handle map readiness
  useEffect(() => {
    if (loaded && map) {
      setIsMapReady(true);
      addNotification("Map loaded successfully", "success");
    } else if (error) {
      setMapError(error);
      addNotification("Failed to load map", "error");
    }
  }, [loaded, map, error, addNotification]);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 0,
        ml: sidebarOpen ? 0 : `-${drawerWidth}px`,
        transition: "margin 0.3s ease-in-out"
      }}
    >
      <Toolbar />

      {/* 🌍 Map Section */}
      <Box
        sx={{
          position: "relative",
          height: "calc(100vh - 64px)",
          bgcolor: darkMode ? "grey.800" : "grey.300",
          overflow: "hidden"
        }}
      >
        {/* Google Map */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Box
            ref={mapRef}
            sx={{
              width: "100%",
              height: "100%",
              display: loaded && isMapReady ? "block" : "none"
            }}
          />

          {/* Loading State */}
          {!loaded && !error && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: darkMode ? "grey.800" : "grey.100",
                gap: 2
              }}
            >
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading Google Maps...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we initialize the map
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {(error || mapError) && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: darkMode ? "grey.800" : "grey.100",
                p: 3
              }}
            >
              <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Map Loading Error
                </Typography>
                <Typography variant="body2">
                  {error ||
                    mapError ||
                    "Failed to load Google Maps. Please check your internet connection and API key."}
                </Typography>
              </Alert>
              <Box
                sx={{
                  width: "100%",
                  height: "200px",
                  border: "2px dashed",
                  borderColor: "grey.400",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.background.paper, 0.5)
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  🗺️ Map Placeholder
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* 🧭 Map Controls */}
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: 60,
            right: 8,
            borderRadius: 2,
            overflow: "hidden"
          }}
        >
          <ButtonGroup orientation="vertical">
            {/* Zoom In */}
            <Tooltip title="Zoom In" placement="left">
              <IconButton
                onClick={() => {
                  if (map && isMapReady) {
                    const newZoom = Math.min(map.getZoom() + 1, 20);
                    map.setZoom(newZoom);
                    setCurrentCoords((prev) => ({ ...prev, zoom: newZoom }));
                  }
                  addNotification("Zoomed in", "info");
                }}
                disabled={!isMapReady}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>

            {/* Zoom Out */}
            <Tooltip title="Zoom Out" placement="left">
              <IconButton
                onClick={() => {
                  if (map && isMapReady) {
                    const newZoom = Math.max(map.getZoom() - 1, 1);
                    map.setZoom(newZoom);
                    setCurrentCoords((prev) => ({ ...prev, zoom: newZoom }));
                  }
                  addNotification("Zoomed out", "info");
                }}
                disabled={!isMapReady}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>

            {/* My Location */}
            <Tooltip title="My Location" placement="left">
              <IconButton
                onClick={() => {
                  if (navigator.geolocation) {
                    addNotification("Getting current location...", "info");
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const newCoords = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                          zoom: currentCoords.zoom
                        };
                        setCurrentCoords(newCoords);
                        if (map && isMapReady) {
                          map.setCenter({
                            lat: newCoords.lat,
                            lng: newCoords.lng
                          });
                        }
                        addNotification("Location updated", "success");
                      },
                      () => addNotification("Location access denied", "error")
                    );
                  } else {
                    addNotification("Geolocation not supported", "error");
                  }
                }}
                disabled={!isMapReady}
              >
                <MyLocation />
              </IconButton>
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip title="Fullscreen" placement="left">
              <IconButton
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                    addNotification("Fullscreen mode activated", "success");
                  } else {
                    document.exitFullscreen();
                    addNotification("Exited fullscreen mode", "info");
                  }
                }}
              >
                <Fullscreen />
              </IconButton>
            </Tooltip>

            {/* Home View */}
            <Tooltip title="Home View" placement="left">
              <IconButton
                onClick={() => {
                  const homeCoords = { lat: 28.6139, lng: 77.209, zoom: 12 }; // Default: Delhi
                  setCurrentCoords(homeCoords);
                  if (map && isMapReady) {
                    map.setCenter({ lat: homeCoords.lat, lng: homeCoords.lng });
                    map.setZoom(homeCoords.zoom);
                  }
                  addNotification("Returned to home view", "success");
                }}
                disabled={!isMapReady}
              >
                <Home />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Paper>

        {/* 🧭 Bearing Panel */}
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            top: 55,
            left: 10,
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(10px)"
          }}
        >
          <Navigation color="primary" />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              N 45° E
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bearing
            </Typography>
          </Box>
        </Paper>

        {/* 📍 Coordinates Display */}
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 60,
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(10px)"
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight="bold">
              Lat: {currentCoords.lat.toFixed(6)}°
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              Lng: {currentCoords.lng.toFixed(6)}°
            </Typography>
            <Typography variant="caption" color="primary">
              Zoom: {currentCoords.zoom}
            </Typography>
          </Stack>
        </Paper>

        {/* 📏 Scale Bar */}
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            bottom: 32,
            left: 10,
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(10px)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 100,
                height: 4,
                bgcolor: "primary.main",
                borderRadius: 1
              }}
            />
            <Typography variant="caption">1 km</Typography>
          </Box>
        </Paper>

        {/* ⚡ SpeedDial Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: "absolute", bottom: 145, right: 6 }}
          icon={<SpeedDialIcon />}
          open={quickActionsOpen}
          onClose={() => setQuickActionsOpen(false)}
          onOpen={() => setQuickActionsOpen(true)}
        >
          {quickActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                addNotification(`${action.name} clicked`, "info");
                setQuickActionsOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    </Box>
  );
};

export default MapContainer;
