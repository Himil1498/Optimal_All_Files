/* DistanceMeasurementTab: Distance measurement tool for Google Maps */
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Stack,
  IconButton,
  Snackbar
} from "@mui/material";
import {
  Clear as ClearIcon,
  Save as SaveIcon,
  ViewModule as ViewAllIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Route as RouteIcon,
  Straighten as DistanceIcon,
  LocationOn as LocationIcon,
  History as HistoryIcon
} from "@mui/icons-material";

import { useCallback } from "react";
import useIndiaBoundary from "../../hooks/useIndiaBoundary";
import useRegionAccess from "../../hooks/useRegionAccess";

export default function DistanceMeasurementTab({ map }) {
  const { isInsideIndia } = useIndiaBoundary(map);
  const { ready, isInsideAllowedArea, fitMapToAllowedRegions } =
    useRegionAccess(map);

  // Measurement state
  const [measuring, setMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const [measurementMarkers, setMeasurementMarkers] = useState([]);
  const [measurementPolyline, setMeasurementPolyline] = useState(null);
  const [segmentDistances, setSegmentDistances] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  // Dialogs and saved data
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [savedData, setSavedData] = useState([]);

  // All measurements for "Show All"
  const [allMarkers, setAllMarkers] = useState([]);
  const [allPolylines, setAllPolylines] = useState([]);
  const [allMeasurements, setAllMeasurements] = useState([]);

  // Distance label markers
  const [distanceLabels, setDistanceLabels] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((point1, point2) => {
    const p1 = new window.google.maps.LatLng(point1.lat, point1.lng);
    const p2 = new window.google.maps.LatLng(point2.lat, point2.lng);
    return (
      window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2) /
      1000
    ); // km
  }, []);

  const updateDistancesAndPolyline = useCallback(
    (points) => {
      // clear old labels & dots
      distanceLabels.forEach((l) => l.setMap(null));
      setDistanceLabels([]);

      if (points.length < 2) return;

      let distances = [];
      let total = 0;
      let newLabels = [];
      let dotMarkers = [];

      for (let i = 1; i < points.length; i++) {
        const d = calculateDistance(points[i - 1], points[i]);
        distances.push({ from: i, to: i + 1, distance: d });
        total += d;

        // add distance label at midpoint
        const midLat = (points[i - 1].lat + points[i].lat) / 2;
        const midLng = (points[i - 1].lng + points[i].lng) / 2;
        const label = new window.google.maps.Marker({
          position: { lat: midLat, lng: midLng },
          map,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
          label: {
            text: `${d.toFixed(2)} km`,
            fontSize: "12px",
            fontWeight: "900",
            color: "#e63946"
          }
        });
        newLabels.push(label);

        // simulate polyline with tiny dots
        const interpolated = interpolatePoints(points[i - 1], points[i], 30);
        interpolated.forEach((p) => {
          const dot = new window.google.maps.Marker({
            position: p,
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 4, // very small dot
              strokeColor: "#667eea",
              fillColor: "#667eea",
              fillOpacity: 1
            }
          });
          dotMarkers.push(dot);
        });
      }

      setSegmentDistances(distances);
      setTotalDistance(total);
      setDistanceLabels([...newLabels, ...dotMarkers]);
    },
    [calculateDistance, map, distanceLabels]
  );

  // Listen for map clicks to add measurement points
  useEffect(() => {
    if (!map || !measuring) return;
    const listener = map.addListener("click", (event) => {
      const newPoint = { lat: event.latLng.lat(), lng: event.latLng.lng() };

      // ✅ Check if the point is inside India and allowed regions
      if (!isInsideIndia(newPoint)) {
        setSnackbarMessage("Cannot add point outside India!");
        setSnackbarOpen(true);
        return;
      }
      if (ready && !isInsideAllowedArea(newPoint)) {
        setSnackbarMessage("You don't have access to this region.");
        setSnackbarOpen(true);
        return;
      }

      const marker = new window.google.maps.Marker({
        position: newPoint,
        map,
        label: `${measurementPoints.length + 1}`
      });
      const updatedPoints = [...measurementPoints, newPoint];
      const updatedMarkers = [...measurementMarkers, marker];
      setMeasurementPoints(updatedPoints);
      setMeasurementMarkers(updatedMarkers);
      updateDistancesAndPolyline(updatedPoints, updatedMarkers);
    });
    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, [
    map,
    measuring,
    measurementPoints,
    measurementMarkers,
    isInsideIndia,
    isInsideAllowedArea,
    ready,
    updateDistancesAndPolyline
  ]);

  useEffect(() => {
    if (!map) return;
    // Fit to allowed regions (if restricted) when tab mounts
    fitMapToAllowedRegions();
  }, [map, fitMapToAllowedRegions]);

  // Utility: interpolate points along a line
  function interpolatePoints(p1, p2, numSteps = 50) {
    const points = [];
    const latStep = (p2.lat - p1.lat) / numSteps;
    const lngStep = (p2.lng - p1.lng) / numSteps;

    for (let i = 0; i <= numSteps; i++) {
      points.push({
        lat: p1.lat + i * latStep,
        lng: p1.lng + i * lngStep
      });
    }
    return points;
  }

  // Clear all measurements and overlays
  const clearMeasurements = () => {
    // Remove markers for current measurement
    measurementMarkers.forEach((m) => m.setMap(null));
    // Remove polyline for current measurement
    if (measurementPolyline) measurementPolyline.setMap(null);
    // Remove distance label markers
    distanceLabels.forEach((label) => label.setMap(null));

    // Remove ALL "Show All" markers & polylines
    allMarkers.forEach((markerArray) => {
      markerArray.forEach((m) => m.setMap(null));
    });
    allPolylines.forEach((p) => p.setMap(null));

    // Reset state
    setMeasurementPoints([]);
    setMeasurementMarkers([]);
    setMeasurementPolyline(null);
    setSegmentDistances([]);
    setTotalDistance(0);
    setDistanceLabels([]);
    setAllMarkers([]);
    setAllPolylines([]);
    setAllMeasurements([]);

    // Reset map to default view (centered on India)
    if (map) {
      map.setCenter({ lat: 22.5, lng: 78.9 }); // Approximate center of India
      map.setZoom(5);
    }
  };

  // Save current measurement to localStorage
  const handleSave = () => {
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem("measurementData")) || [];
    } catch {
      existing = [];
    }
    const newEntry = {
      points: measurementPoints,
      totalDistance,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(
      "measurementData",
      JSON.stringify([...existing, newEntry])
    );
    setSaveDialogOpen(false);
    alert("Measurement saved!");
  };

  // Load saved measurements from localStorage
  const handleViewSaved = () => {
    let data = [];
    try {
      data = JSON.parse(localStorage.getItem("measurementData")) || [];
    } catch {
      data = [];
    }
    setSavedData(data);
    setViewDialogOpen(true);
    setAllMeasurements(data); // Load all for "Show All"
  };

  // Restore a single measurement from saved list
  const handleRestoreMeasurement = (measurement) => {
    const allInside = measurement.points.every(isInsideIndia);
    if (!allInside) {
      setSnackbarMessage(
        "Cannot restore measurement: some points are outside India!"
      );
      setSnackbarOpen(true);
      return;
    }

    clearMeasurements();
    const markers = measurement.points.map((p, i) => {
      return new window.google.maps.Marker({
        position: p,
        map,
        label: `${i + 1}`
      });
    });
    setMeasurementPoints(measurement.points);
    setMeasurementMarkers(markers);
    updateDistancesAndPolyline(measurement.points, markers);
    setViewDialogOpen(false);
  };

  // Show all saved measurements on the map
  const handleShowAllMeasurements = () => {
    // Always load latest saved measurements
    let data = [];
    try {
      data = JSON.parse(localStorage.getItem("measurementData")) || [];
    } catch {
      data = [];
    }

    // If no measurements, show dialog
    if (data.length === 0) {
      setSavedData([]);
      setViewDialogOpen(true);
      return;
    }

    setAllMeasurements(data);

    // Clear previous overlays
    allMarkers.forEach((markerArray) =>
      markerArray.forEach((m) => m.setMap(null))
    );
    allPolylines.forEach((p) => p.setMap(null));
    distanceLabels.forEach((label) => label.setMap(null));
    setAllMarkers([]);
    setAllPolylines([]);
    setDistanceLabels([]);

    // Draw all measurements
    let newMarkers = [];
    let newPolylines = [];
    let newLabels = [];
    data.forEach((measurement) => {
      const markers = measurement.points.map((p, i) => {
        const marker = new window.google.maps.Marker({
          position: p,
          map,
          label: `${i + 1}`
        });
        return marker;
      });
      const polyline = new window.google.maps.Polyline({
        path: measurement.points,
        geodesic: true,
        strokeColor: "#667eea",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map
      });
      for (let i = 1; i < measurement.points.length; i++) {
        const d = calculateDistance(
          measurement.points[i - 1],
          measurement.points[i]
        );
        const midLat =
          (measurement.points[i - 1].lat + measurement.points[i].lat) / 2;
        const midLng =
          (measurement.points[i - 1].lng + measurement.points[i].lng) / 2;
        const label = new window.google.maps.Marker({
          position: { lat: midLat, lng: midLng },
          map,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
          label: {
            text: `${d.toFixed(2)} km`,
            fontSize: "12px",
            fontWeight: "600",
            color: "#e63946"
          }
        });
        newLabels.push(label);
      }
      newMarkers.push(markers);
      newPolylines.push(polyline);
    });
    setAllMarkers(newMarkers);
    setAllPolylines(newPolylines);
    setDistanceLabels(newLabels);
  };

  // Delete a measurement from localStorage and map
  const handleDeleteMeasurement = (index) => {
    // Remove markers and polyline for this measurement
    allMarkers[index]?.forEach((marker) => marker.setMap(null));
    allPolylines[index]?.setMap(null);

    // Remove all distance labels from map
    distanceLabels.forEach((label) => label.setMap(null));
    setDistanceLabels([]);

    // Update localStorage and state
    const updatedData = allMeasurements.filter((_, i) => i !== index);
    localStorage.setItem("measurementData", JSON.stringify(updatedData));
    setAllMeasurements(updatedData);
    setAllMarkers(allMarkers.filter((_, i) => i !== index));
    setAllPolylines(allPolylines.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <DistanceIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}
            >
              Distance Measurement
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.875rem" }}
            >
              Click on the map to measure distances between points
            </Typography>
          </Box>
        </Box>
        {/* Measurement mode indicator */}
        {measuring && (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#667eea",
                animation: "pulse 1.5s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1, transform: "scale(1)" },
                  "50%": { opacity: 0.5, transform: "scale(1.2)" }
                }
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "#667eea", fontWeight: 600 }}
            >
              Measurement mode active - Click on map to add points
            </Typography>
          </Box>
        )}
      </Box>

      {/* Control Buttons */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        {/* Start/Stop Measuring */}
        <Button
          variant={measuring ? "outlined" : "contained"}
          onClick={() => setMeasuring(!measuring)}
          startIcon={measuring ? <StopIcon /> : <StartIcon />}
          sx={{
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            ...(measuring
              ? {
                  color: "#dc3545",
                  borderColor: "#dc3545",
                  "&:hover": {
                    backgroundColor: "rgba(220, 53, 69, 0.04)",
                    borderColor: "#dc3545"
                  }
                }
              : {
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                    transform: "translateY(-1px)"
                  }
                })
          }}
        >
          {measuring ? "Stop Measuring" : "Start Measuring"}
        </Button>

        {/* Clear and Save */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Tooltip title="Clear all measurements">
            <span>
              <Button
                variant="outlined"
                onClick={clearMeasurements}
                startIcon={<ClearIcon />}
                disabled={
                  measurementPoints.length === 0 &&
                  allMarkers.length === 0 &&
                  allPolylines.length === 0
                }
                sx={{
                  width: "100%",
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#dc3545",
                    color: "#dc3545",
                    backgroundColor: "rgba(220, 53, 69, 0.04)"
                  }
                }}
              >
                Clear All
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Save current measurement">
            <span>
              <Button
                variant="outlined"
                disabled={measurementPoints.length === 0}
                onClick={() => setSaveDialogOpen(true)}
                startIcon={<SaveIcon />}
                sx={{
                  width: "100%",
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#28a745",
                    color: "#28a745",
                    backgroundColor: "rgba(40, 167, 69, 0.04)"
                  },
                  "&:disabled": {
                    opacity: 0.5
                  }
                }}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Saved and Show All */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleViewSaved}
            startIcon={<HistoryIcon />}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderColor: "rgba(0, 0, 0, 0.12)",
              color: "#64748b",
              "&:hover": {
                borderColor: "#667eea",
                color: "#667eea",
                backgroundColor: "rgba(102, 126, 234, 0.04)"
              }
            }}
          >
            Saved
          </Button>
          <Button
            variant="outlined"
            onClick={handleShowAllMeasurements}
            startIcon={<ViewAllIcon />}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderColor: "rgba(0, 0, 0, 0.12)",
              color: "#64748b",
              "&:hover": {
                borderColor: "#667eea",
                color: "#667eea",
                backgroundColor: "rgba(102, 126, 234, 0.04)"
              }
            }}
          >
            Show All
          </Button>
        </Box>
      </Stack>

      {/* Distance Display Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "16px",
          background:
            totalDistance > 0
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))"
              : "rgba(248, 250, 252, 1)",
          border:
            totalDistance > 0
              ? "1px solid rgba(102, 126, 234, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)"
        }}
      >
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 1
            }}
          >
            <RouteIcon sx={{ color: "#667eea", fontSize: 24 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
              {totalDistance.toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 500 }}>
              km
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Total Distance Measured
          </Typography>
          {measurementPoints.length > 0 && (
            <Chip
              icon={<LocationIcon sx={{ fontSize: 16 }} />}
              label={`${measurementPoints.length} points`}
              size="small"
              sx={{
                mt: 2,
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                color: "#667eea",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "#667eea" }
              }}
            />
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // 3 seconds
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Current Segments Table */}
      {segmentDistances.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: "16px", overflow: "hidden" }}>
          <Box sx={{ backgroundColor: "#f1f5f9", p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#334155" }}>
              Current Measurement Segments
            </Typography>
          </Box>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Distance (km)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {segmentDistances.map((seg, i) => (
                    <TableRow key={i}>
                      <TableCell>Point {seg.from}</TableCell>
                      <TableCell>Point {seg.to}</TableCell>
                      <TableCell>{seg.distance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ✅ Delete Current Measurement button */}
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  // clear numbered point markers
                  measurementMarkers.forEach((m) => m.setMap(null));
                  setMeasurementMarkers([]);

                  // clear polyline
                  if (measurementPolyline) {
                    measurementPolyline.setMap(null);
                    setMeasurementPolyline(null);
                  }

                  // clear labels + dotted markers (all stored in distanceLabels)
                  distanceLabels.forEach((l) => l.setMap(null));
                  setDistanceLabels([]);

                  // reset state
                  setMeasurementPoints([]);
                  setSegmentDistances([]);
                  setTotalDistance(0);
                }}
              >
                Delete Current Measurement
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* All Measurements Summary */}
      {allMeasurements.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: "16px", overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #e8f5e8, #f0f9f0)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)"
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "1rem" }}
            >
              All Measurements Summary
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Measurement
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Distance (km)
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Saved At
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Actions
                  </TableCell>{" "}
                  {/* <-- Add this */}
                </TableRow>
              </TableHead>

              <TableBody>
                {allMeasurements.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>#{i + 1}</TableCell>
                    <TableCell>{m.totalDistance.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(m.savedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setDeleteIndex(i);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: "16px", minWidth: 360 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SaveIcon sx={{ color: "#28a745" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Save Measurement
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(40, 167, 69, 0.04)",
              border: "1px solid rgba(40, 167, 69, 0.1)",
              mb: 2
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              Measurement Summary:
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
              • {measurementPoints.length} measurement points
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              • Total distance: {totalDistance.toFixed(2)} km
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            This measurement will be saved to your local storage and can be
            restored later.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #28a745, #20c997)",
              "&:hover": {
                background: "linear-gradient(135deg, #218838, #1ea66d)"
              }
            }}
          >
            Save Measurement
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Saved Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", maxHeight: "80vh" }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <HistoryIcon sx={{ color: "#667eea" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Saved Measurements
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {savedData.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#64748b", mb: 2 }}>
                No saved measurements yet.
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Create a measurement and save it to see it here.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {savedData.map((m, i) => (
                <Card
                  key={i}
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
                    },
                    "&:last-child": { mb: 0 }
                  }}
                  onClick={() => handleRestoreMeasurement(m)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, fontSize: "1rem" }}
                      >
                        Measurement #{i + 1}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`${m.points?.length || 0} points`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent restoring measurement
                            handleDeleteMeasurement(i);
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}
                    >
                      {m.totalDistance.toFixed(2)} km
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Saved: {new Date(m.savedAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "16px", minWidth: 320 } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this measurement?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteMeasurement(deleteIndex);
              setDeleteDialogOpen(false);
              setDeleteIndex(null);
            }}
            color="error"
            variant="contained"
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
