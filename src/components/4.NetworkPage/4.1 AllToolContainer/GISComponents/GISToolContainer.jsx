import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Stack,
  ButtonGroup,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  Collapse,
  useTheme,
  alpha
} from "@mui/material";
import {
  MyLocation,
  GpsFixed,
  RadioButtonUnchecked,
  Timeline,
  Straighten,
  Place,
  Search,
  Clear,
  Refresh,
  Settings,
  ExpandMore,
  ExpandLess,
  Visibility,
  VisibilityOff,
  CenterFocusStrong,
  LocationSearching,
  TuneRounded,
  Analytics,
  Room
} from "@mui/icons-material";
import MapContainer from "./MapContainer";

const GISToolContainer = ({
  sidebarOpen,
  drawerWidth,
  darkMode,
  mapRef,
  map,
  loaded,
  error,
  addNotification,
  quickActionsOpen,
  setQuickActionsOpen,
  quickActions
}) => {
  const theme = useTheme();

  // WOK-specific state
  const [wokCoordinates, setWokCoordinates] = useState({
    lat: 28.6139, // Default to New Delhi
    lng: 77.209,
    zoom: 12
  });

  const [dynamicDistance, setDynamicDistance] = useState(1); // Default 1km
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [showRadius, setShowRadius] = useState(true);
  const [coordinateInputMode, setCoordinateInputMode] = useState("manual"); // manual, current, search
  const [searchLocation, setSearchLocation] = useState("");
  const [wokAnalysisEnabled, setWokAnalysisEnabled] = useState(true);
  const [expandedPanel, setExpandedPanel] = useState("coordinates");

  // Map elements state
  const [radiusCircle, setRadiusCircle] = useState(null);

  // Analysis results
  const [analysisResults, setAnalysisResults] = useState({
    pointsOfInterest: 0,
    infrastructure: 0,
    coverage: "0%",
    lastUpdate: null
  });

  // WOK Tools configuration
  const [activeWokTools, setActiveWokTools] = useState({
    radiusAnalysis: true,
    proximitySearch: true,
    coordinateTracking: true,
    distanceMeasurement: true,
    spatialAnalysis: false
  });

  // Distance unit conversion
  const convertDistance = useCallback((distance, fromUnit, toUnit) => {
    const conversions = {
      km: { m: 1000, mi: 0.621371, ft: 3280.84 },
      m: { km: 0.001, mi: 0.000621371, ft: 3.28084 },
      mi: { km: 1.60934, m: 1609.34, ft: 5280 },
      ft: { km: 0.0003048, m: 0.3048, mi: 0.000189394 }
    };

    if (fromUnit === toUnit) return distance;
    return distance * conversions[fromUnit][toUnit];
  }, []);

  // Update coordinates handler
  const handleCoordinateChange = useCallback(
    (field, value) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const newCoords = {
          ...wokCoordinates,
          [field]: numValue
        };
        setWokCoordinates(newCoords);

        // Update the Google Map if available
        if (map && loaded) {
          try {
            map.setCenter({ lat: newCoords.lat, lng: newCoords.lng });
            addNotification(
              `${field === "lat" ? "Latitude" : "Longitude"} updated`,
              "info"
            );
          } catch (error) {
            console.error("Error updating map center:", error);
          }
        }
      }
    },
    [wokCoordinates, map, loaded, addNotification]
  );

  // Perform WOK analysis
  const performWokAnalysis = useCallback(
    async (coordinates = wokCoordinates) => {
      if (!wokAnalysisEnabled) return;

      addNotification("Performing WOK analysis...", "info");

      // Simulate analysis with dynamic data
      const simulatedResults = {
        pointsOfInterest: Math.floor(Math.random() * 50) + 10,
        infrastructure: Math.floor(Math.random() * 30) + 5,
        coverage: `${Math.floor(Math.random() * 40) + 60}%`,
        lastUpdate: new Date().toLocaleTimeString()
      };

      setTimeout(() => {
        setAnalysisResults(simulatedResults);
        addNotification("WOK analysis completed", "success");
      }, 1500);
    },
    [wokCoordinates, wokAnalysisEnabled, addNotification]
  );

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      addNotification("Getting current location...", "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: wokCoordinates.zoom
          };
          setWokCoordinates(newCoords);

          // Update Google Map if available
          if (map && loaded) {
            try {
              map.setCenter({ lat: newCoords.lat, lng: newCoords.lng });
              // Add a marker for current location
              const marker = new google.maps.Marker({
                position: { lat: newCoords.lat, lng: newCoords.lng },
                map: map,
                title: "Current Location",
                icon: {
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(
                      '<svg fill="#1976d2" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
                    ),
                  scaledSize: new google.maps.Size(32, 32)
                }
              });

              // Remove marker after 5 seconds
              setTimeout(() => marker.setMap(null), 5000);
            } catch (error) {
              console.error("Error updating map with current location:", error);
            }
          }

          addNotification("Current location updated", "success");
          performWokAnalysis(newCoords);
        },
        (error) => {
          let errorMessage = "Location access denied";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          addNotification(errorMessage, "error");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      addNotification("Geolocation not supported by this browser", "error");
    }
  }, [wokCoordinates.zoom, addNotification, map, loaded, performWokAnalysis]);

  // Search location handler with Google Geocoding
  const handleLocationSearch = useCallback(async () => {
    if (!searchLocation.trim()) {
      addNotification("Please enter a location to search", "warning");
      return;
    }

    if (!map || !loaded) {
      addNotification("Map not ready. Please wait...", "warning");
      return;
    }

    addNotification(`Searching for ${searchLocation}...`, "info");

    try {
      // Use Google Geocoding service if available
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: searchLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const newCoordinates = {
            lat: location.lat(),
            lng: location.lng(),
            zoom: wokCoordinates.zoom
          };

          setWokCoordinates(newCoordinates);
          map.setCenter(location);

          // Add a marker for the searched location
          const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: results[0].formatted_address,
            animation: google.maps.Animation.DROP
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #1976d2;">${
                  results[0].formatted_address
                }</h3>
                <p style="margin: 0; color: #666;">Lat: ${location
                  .lat()
                  .toFixed(6)}<br/>Lng: ${location.lng().toFixed(6)}</p>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          // Remove marker after 10 seconds
          setTimeout(() => {
            marker.setMap(null);
            infoWindow.close();
          }, 10000);

          addNotification(
            `Location found: ${results[0].formatted_address}`,
            "success"
          );
          performWokAnalysis(newCoordinates);
        } else {
          addNotification(`Location not found: ${searchLocation}`, "error");
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      // Fallback to mock search
      setTimeout(() => {
        const mockCoordinates = {
          lat: 28.6139 + (Math.random() - 0.5) * 0.1,
          lng: 77.209 + (Math.random() - 0.5) * 0.1,
          zoom: wokCoordinates.zoom
        };
        setWokCoordinates(mockCoordinates);
        if (map)
          map.setCenter({ lat: mockCoordinates.lat, lng: mockCoordinates.lng });
        addNotification(`Mock location found: ${searchLocation}`, "info");
        performWokAnalysis(mockCoordinates);
      }, 1000);
    }
  }, [
    searchLocation,
    wokCoordinates.zoom,
    addNotification,
    performWokAnalysis,
    map,
    loaded
  ]);

  // Update radius circle on map
  useEffect(() => {
    if (map && loaded && showRadius) {
      try {
        // Remove existing circle
        if (radiusCircle) {
          radiusCircle.setMap(null);
        }

        // Convert distance to meters
        const radiusInMeters = convertDistance(
          dynamicDistance,
          distanceUnit,
          "m"
        );

        // Create new circle
        const circle = new google.maps.Circle({
          strokeColor: "#1976d2",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#1976d2",
          fillOpacity: 0.15,
          map: map,
          center: { lat: wokCoordinates.lat, lng: wokCoordinates.lng },
          radius: radiusInMeters
        });

        setRadiusCircle(circle);

        // Add click listener to circle
        circle.addListener("click", (event) => {
          const clickedLat = event.latLng.lat();
          const clickedLng = event.latLng.lng();
          addNotification(
            `Clicked within radius: ${clickedLat.toFixed(
              6
            )}, ${clickedLng.toFixed(6)}`,
            "info"
          );
        });
      } catch (error) {
        console.error("Error updating radius circle:", error);
      }
    } else if (radiusCircle) {
      // Hide circle if showRadius is false
      radiusCircle.setMap(null);
      setRadiusCircle(null);
    }

    // Cleanup function
    return () => {
      if (radiusCircle) {
        radiusCircle.setMap(null);
      }
    };
  }, [
    map,
    loaded,
    showRadius,
    wokCoordinates,
    dynamicDistance,
    distanceUnit,
    convertDistance,
    addNotification
  ]);

  // Auto-analysis when coordinates or distance change
  useEffect(() => {
    if (wokAnalysisEnabled) {
      const debounceTimer = setTimeout(() => {
        performWokAnalysis();
      }, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [wokCoordinates, dynamicDistance, performWokAnalysis, wokAnalysisEnabled]);

  const renderCoordinateControls = () => (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title="WOK Coordinates"
        action={
          <ButtonGroup size="small">
            <Tooltip title="Get Current Location">
              <IconButton onClick={getCurrentLocation} color="primary">
                <MyLocation />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center Map">
              <IconButton
                onClick={() => {
                  addNotification("Map centered on coordinates", "info");
                  // In real implementation, this would center the map
                }}
                color="secondary"
              >
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        }
        titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Latitude"
              type="number"
              value={wokCoordinates.lat}
              onChange={(e) => handleCoordinateChange("lat", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ step: 0.000001 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption">°N</Typography>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Longitude"
              type="number"
              value={wokCoordinates.lng}
              onChange={(e) => handleCoordinateChange("lng", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ step: 0.000001 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption">°E</Typography>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Search Location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              fullWidth
              size="small"
              onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleLocationSearch}
                      disabled={!searchLocation.trim()}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderDistanceControls = () => (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title="Dynamic Distance Controls"
        action={
          <FormControlLabel
            control={
              <Switch
                checked={showRadius}
                onChange={(e) => setShowRadius(e.target.checked)}
                size="small"
              />
            }
            label="Show Radius"
          />
        }
        titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Distance: {dynamicDistance} {distanceUnit}
            </Typography>
            <Slider
              value={dynamicDistance}
              onChange={(e, newValue) => setDynamicDistance(newValue)}
              min={0.1}
              max={10}
              step={0.1}
              marks={[
                { value: 0.5, label: "0.5" },
                { value: 1, label: "1" },
                { value: 2, label: "2" },
                { value: 5, label: "5" },
                { value: 10, label: "10" }
              ]}
              sx={{ mt: 1 }}
            />
          </Box>

          <FormControl size="small">
            <InputLabel>Distance Unit</InputLabel>
            <Select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              label="Distance Unit"
            >
              <MenuItem value="km">Kilometers</MenuItem>
              <MenuItem value="m">Meters</MenuItem>
              <MenuItem value="mi">Miles</MenuItem>
              <MenuItem value="ft">Feet</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Converted:{" "}
              {convertDistance(dynamicDistance, distanceUnit, "m").toFixed(0)}m,{" "}
              {convertDistance(dynamicDistance, distanceUnit, "mi").toFixed(2)}
              mi
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderWokAnalysis = () => (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title="WOK Analysis Results"
        action={
          <ButtonGroup size="small">
            <IconButton
              onClick={() => performWokAnalysis()}
              color="primary"
              disabled={!wokAnalysisEnabled}
            >
              <Refresh />
            </IconButton>
            <IconButton
              onClick={() => setWokAnalysisEnabled(!wokAnalysisEnabled)}
              color={wokAnalysisEnabled ? "success" : "default"}
            >
              <Analytics />
            </IconButton>
          </ButtonGroup>
        }
        titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
      />
      <CardContent>
        {wokAnalysisEnabled ? (
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Chip
                label={`${analysisResults.pointsOfInterest} POIs`}
                color="primary"
                size="small"
                icon={<Place />}
              />
            </Grid>
            <Grid item xs={6}>
              <Chip
                label={`${analysisResults.infrastructure} Infrastructure`}
                color="secondary"
                size="small"
                icon={<Room />}
              />
            </Grid>
            <Grid item xs={6}>
              <Chip
                label={`${analysisResults.coverage} Coverage`}
                color="success"
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                {analysisResults.lastUpdate &&
                  `Updated: ${analysisResults.lastUpdate}`}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ py: 0 }}>
            WOK analysis is disabled. Enable to see results.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderWokTools = () => (
    <Card>
      <CardHeader
        title="WOK Tools"
        titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
      />
      <CardContent>
        <Stack spacing={1}>
          {Object.entries(activeWokTools).map(([tool, enabled]) => (
            <FormControlLabel
              key={tool}
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) =>
                    setActiveWokTools((prev) => ({
                      ...prev,
                      [tool]: e.target.checked
                    }))
                  }
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  {tool
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Typography>
              }
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
      {/* WOK Control Panel - Collapsible */}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          top: 64,
          left: sidebarOpen ? drawerWidth + 8 : 8,
          width: 320,
          maxHeight: "calc(100vh - 80px)",
          overflow: "auto",
          zIndex: 1200,
          transition: "left 0.3s ease-in-out",
          bgcolor: alpha(theme.palette.background.paper, 0.97),
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
          >
            <GpsFixed color="primary" />
            WOK Control Center
            <Box sx={{ ml: "auto" }}>
              <Typography
                variant="caption"
                color="success.main"
                sx={{ fontWeight: "bold" }}
              >
                Active
              </Typography>
            </Box>
          </Typography>

          {renderCoordinateControls()}
          {renderDistanceControls()}
          {renderWokAnalysis()}
          {renderWokTools()}
        </Box>
      </Paper>

      {/* Enhanced Map Container with WOK Integration */}
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? 0 : `-${drawerWidth}px`,
          transition: "margin 0.3s ease-in-out",
          position: "relative"
        }}
      >
        <MapContainer
          sidebarOpen={sidebarOpen}
          drawerWidth={drawerWidth}
          darkMode={darkMode}
          mapRef={mapRef}
          map={map}
          loaded={loaded}
          error={error}
          currentCoords={wokCoordinates}
          setCurrentCoords={setWokCoordinates}
          addNotification={addNotification}
          quickActionsOpen={quickActionsOpen}
          setQuickActionsOpen={setQuickActionsOpen}
          quickActions={quickActions}
        />
      </Box>

      {/* WOK Distance Indicator on Map */}
      {showRadius && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            top: 120,
            right: 20,
            p: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.95),
            backdropFilter: "blur(12px)",
            zIndex: 1100,
            border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
            borderRadius: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RadioButtonUnchecked color="inherit" sx={{ color: "white" }} />
            <Typography variant="body2" fontWeight="bold" color="white">
              Radius: {dynamicDistance} {distanceUnit}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* WOK Coordinates Display Enhancement */}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 100,
          right: 20,
          p: 2,
          bgcolor: alpha(theme.palette.success.main, 0.95),
          backdropFilter: "blur(12px)",
          zIndex: 1100,
          border: `1px solid ${alpha(theme.palette.success.light, 0.3)}`,
          borderRadius: 2,
          minWidth: 200
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="white"
            sx={{ mb: 0.5 }}
          >
            🎯 WOK Coordinates
          </Typography>
          <Typography variant="body2" fontWeight="600" color="white">
            Lat: {wokCoordinates.lat.toFixed(6)}°
          </Typography>
          <Typography variant="body2" fontWeight="600" color="white">
            Lng: {wokCoordinates.lng.toFixed(6)}°
          </Typography>
          {wokAnalysisEnabled && (
            <Typography
              variant="caption"
              color="white"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "white",
                  animation: "pulse 2s infinite"
                }}
              />
              Analysis: Active
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default GISToolContainer;
