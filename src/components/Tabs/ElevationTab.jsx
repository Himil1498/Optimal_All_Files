import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Container,
  Grid,
  alpha,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Slide,
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Terrain as TerrainIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import useIndiaBoundary from "../../hooks/useIndiaBoundary";
import useRegionAccess from "../../hooks/useRegionAccess";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

export default function ElevationViewer({ map }) {
  const { isInsideIndia } = useIndiaBoundary(map);
  const { ready, isInsideAllowedArea, fitMapToAllowedRegions } =
    useRegionAccess(map);

  const theme = useTheme();
  // Removed unused search refs

  const [drawing, setDrawing] = useState(false);
  const [elevationPoints, setElevationPoints] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [polyline, setPolyline] = useState(null);
  const [elevationProfile, setElevationProfile] = useState([]);
  const [highPoint, setHighPoint] = useState(null);
  const [lowPoint, setLowPoint] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [highPointMarker, setHighPointMarker] = useState(null);
  const [lowPointMarker, setLowPointMarker] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    index: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const chartRef = useRef(null);
  // Removed unused search state
  // Removed unused search markers
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // 1️⃣ Autocomplete
  // Remove unused autocomplete scaffolding for now

  // 2️⃣ Map Click Listener for drawing & elevation
  // click listener handled below

  // Keep for future use (lint: intentionally unused)
  /* eslint-disable no-unused-vars */
  const addPlaceToRoute = (location, placeName) => {
    const label = String.fromCharCode(65 + elevationPoints.length);
    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      label: {
        text: label, // e.g. "A", "B", "C"
        color: "white",
        fontSize: "14px",
        fontWeight: "bold"
      },
      animation: window.google.maps.Animation.DROP
    });

    const newPoints = [...elevationPoints, location];
    const newMarkers = [...markers, marker];

    setElevationPoints(newPoints);
    setMarkers(newMarkers);

    // Update polyline
    if (polyline) polyline.setMap(null);
    if (newPoints.length > 1) {
      const pl = new window.google.maps.Polyline({
        path: newPoints,
        map: map,
        strokeColor: theme.palette.primary.main,
        strokeWeight: 4,
        strokeOpacity: 0.8
      });
      setPolyline(pl);
    }

    showSnackbar(`${placeName} added to route as point ${label}`, "success");
  };
  /* eslint-enable no-unused-vars */

  // Omit custom search flow for now

  // Omitted helper

  // Load saved data
  useEffect(() => {
    const stored = localStorage.getItem("elevationData");
    if (stored) setSavedData(JSON.parse(stored));
  }, []);

  const saveToLocalStorage = (data) =>
    localStorage.setItem("elevationData", JSON.stringify(data));

  const calculateDistance = (p1, p2) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getTotalDistance = (points) => {
    let total = 0;
    for (let i = 1; i < points.length; i++)
      total += calculateDistance(points[i - 1], points[i]);
    return total;
  };

  const clearMap = () => {
    if (map) {
      // Remove all elevation markers
      markers.forEach((m) => m.setMap(null));
      // Remove polyline
      if (polyline) polyline.setMap(null);
      // Remove high/low markers
      if (highPointMarker) highPointMarker.setMap(null);
      if (lowPointMarker) lowPointMarker.setMap(null);
      // Remove search markers (not used)
    }

    // Clear all state
    setElevationPoints([]);
    setMarkers([]);
    setPolyline(null);
    setElevationProfile([]);
    setHighPoint(null);
    setLowPoint(null);
    setTotalDistance(0);
    setHighPointMarker(null);
    setLowPointMarker(null);

    showSnackbar("Map cleared", "info");
  };

  // Omitted helper

  const getElevationData = async (points) => {
    return new Promise((resolve, reject) => {
      const elevator = new window.google.maps.ElevationService();

      elevator.getElevationAlongPath(
        {
          path: points,
          samples: 512 // Increased samples for better accuracy
        },
        (results, status) => {
          if (status === window.google.maps.ElevationStatus.OK && results) {
            let cumDist = 0;
            const profile = results.map((r, idx) => {
              if (idx > 0) {
                cumDist += calculateDistance(
                  {
                    lat: results[idx - 1].location.lat(),
                    lng: results[idx - 1].location.lng()
                  },
                  { lat: r.location.lat(), lng: r.location.lng() }
                );
              }
              return {
                lat: r.location.lat(),
                lng: r.location.lng(),
                elevation: r.elevation,
                distance: cumDist,
                index: idx
              };
            });

            // Find all points with max and min elevation
            const maxElev = Math.max(...profile.map((p) => p.elevation));
            const minElev = Math.min(...profile.map((p) => p.elevation));

            // Find the first occurrence of max and min elevation
            const highPoint = profile.find((p) => p.elevation === maxElev);
            const lowPoint = profile.find((p) => p.elevation === minElev);

            setHighPoint(highPoint);
            setLowPoint(lowPoint);
            setElevationProfile(profile);
            console.log("Elevation profile generated:", {
              highPoint,
              lowPoint
            });

            resolve(profile);
          } else {
            console.error("Elevation service failed:", status);
            reject("Elevation service failed");
          }
        }
      );
    });
  };

  useEffect(() => {
    if (!map || !drawing) return;

    const listener = map.addListener("click", (event) => {
      const pos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      const label = String.fromCharCode(65 + elevationPoints.length);

      // ✅ Corrected: check if point is inside India
      if (!isInsideIndia(pos)) {
        setSnackbarMessage("Cannot add point outside India!");
        setSnackbarOpen(true);
        return;
      }
      if (ready && !isInsideAllowedArea(pos)) {
        setSnackbarMessage("You don't have access to this region.");
        setSnackbarOpen(true);
        return;
      }

      const marker = new window.google.maps.Marker({
        position: pos,
        map: map,
        label: String.fromCharCode(65 + elevationPoints.length), // A, B, C...
        animation: window.google.maps.Animation.DROP
      });

      const newPoints = [...elevationPoints, pos];
      const newMarkers = [...markers, marker];

      setElevationPoints(newPoints);
      setMarkers(newMarkers);

      if (polyline) polyline.setMap(null);
      if (newPoints.length > 1) {
        const pl = new window.google.maps.Polyline({
          path: newPoints,
          map: map,
          strokeColor: theme.palette.primary.main,
          strokeWeight: 4,
          strokeOpacity: 0.8
        });
        setPolyline(pl);
      }

      showSnackbar(`Point ${label} added`, "success");
    });

    return () => window.google.maps.event.removeListener(listener);
  }, [
    map,
    drawing,
    elevationPoints,
    markers,
    polyline,
    theme,
    isInsideIndia,
    isInsideAllowedArea,
    ready
  ]);

  useEffect(() => {
    if (!map) return;
    fitMapToAllowedRegions();
  }, [map, fitMapToAllowedRegions]);

  const generateProfile = async () => {
    if (elevationPoints.length < 2) {
      showSnackbar("Add at least 2 points", "warning");
      return;
    }

    // ✅ Check if all points are inside India
    const allInside = elevationPoints.every((p) => isInsideIndia(p));
    if (!allInside) {
      showSnackbar("Some points are outside India", "warning");
      return;
    }

    setIsGenerating(true);
    await getElevationData(elevationPoints);
    setTotalDistance(getTotalDistance(elevationPoints));
    showSnackbar("Profile generated", "success");
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!map) return;

    if (highPointMarker) highPointMarker.setMap(null);
    if (lowPointMarker) lowPointMarker.setMap(null);

    if (highPoint) {
      const hMarker = new window.google.maps.Marker({
        position: { lat: highPoint.lat, lng: highPoint.lng },
        map: map,
        label: "H",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: theme.palette.success.main,
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
          scale: 8
        }
      });
      setHighPointMarker(hMarker);
    }
    if (lowPoint) {
      const lMarker = new window.google.maps.Marker({
        position: { lat: lowPoint.lat, lng: lowPoint.lng },
        map: map,
        label: "L",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: theme.palette.error.main,
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
          scale: 8
        }
      });
      setLowPointMarker(lMarker);
    }
  }, [highPoint, lowPoint, map, theme, highPointMarker, lowPointMarker]);

  const saveStats = () => {
    if (!highPoint || !lowPoint) {
      showSnackbar("Generate profile first", "warning");
      return;
    }

    const record = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      points: elevationPoints.map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        label: String.fromCharCode(65 + i)
      })),
      high: highPoint,
      low: lowPoint,
      totalDistance,
      elevationGain: highPoint.elevation - lowPoint.elevation,
      profile: elevationProfile
    };

    const updatedData = [...savedData, record];
    setSavedData(updatedData);
    saveToLocalStorage(updatedData);
    setSaveDialogOpen(false);
    showSnackbar("Data saved", "success");
  };

  const confirmDelete = (index) => setDeleteDialog({ open: true, index });

  const deleteRecord = () => {
    const updated = [...savedData];
    updated.splice(deleteDialog.index, 1);
    setSavedData(updated);
    saveToLocalStorage(updated);
    setDeleteDialog({ open: false, index: null });

    // Clear map completely
    clearMap();

    showSnackbar("Record deleted", "info");
  };

  const showSavedPoints = (record) => {
    clearMap();
    if (!map) return;

    const savedMarkers = record.points.map((p, idx) => {
      const m = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        label: String.fromCharCode(65 + idx),
        title: `Point ${String.fromCharCode(65 + idx)}`
      });
      return m;
    });

    setMarkers(savedMarkers);

    if (record.points.length > 1) {
      const pl = new window.google.maps.Polyline({
        path: record.points.map((p) => ({ lat: p.lat, lng: p.lng })),
        map,
        strokeColor: theme.palette.primary.main,
        strokeWeight: 4,
        strokeOpacity: 0.8
      });
      setPolyline(pl);
    }

    setElevationPoints(record.points.map((p) => ({ lat: p.lat, lng: p.lng })));
    setElevationProfile(record.profile || []);
    setTotalDistance(record.totalDistance);
    showSnackbar("Saved route displayed", "info");
  };

  const chartData = {
    labels: elevationProfile.map((p) => p.distance.toFixed(1)),
    datasets: [
      {
        label: "Elevation (m)",
        data: elevationProfile.map((p) => p.elevation),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            context.chart.height
          );
          gradient.addColorStop(0, alpha(theme.palette.primary.main, 0.3));
          gradient.addColorStop(1, alpha(theme.palette.primary.main, 0.05));
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: elevationProfile.map((p) => {
          if (highPoint && p.distance === highPoint.distance) return 6;
          if (lowPoint && p.distance === lowPoint.distance) return 6;
          return 0; // Hide other points for cleaner look
        }),
        pointBackgroundColor: elevationProfile.map((p) => {
          if (highPoint && p.distance === highPoint.distance)
            return theme.palette.success.main;
          if (lowPoint && p.distance === lowPoint.distance)
            return theme.palette.error.main;
          return "transparent";
        }),
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: 500
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Elevation: ${ctx.raw.toFixed(1)} m`,
          title: (ctx) => `Distance: ${parseFloat(ctx[0].label).toFixed(2)} km`,
          afterLabel: (context) => {
            if (highPoint && context.raw === highPoint.elevation) {
              return "Highest Point";
            }
            if (lowPoint && context.raw === lowPoint.elevation) {
              return "Lowest Point";
            }
            return null;
          }
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
          speed: 0.1
        },
        pan: {
          enabled: true,
          mode: "x",
          speed: 0.1
        },
        limits: {
          x: { min: "original", max: "original" },
          y: { min: "original", max: "original" }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Distance (km)",
          font: { weight: "bold", size: 14 }
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      },
      y: {
        title: {
          display: true,
          text: "Elevation (m)",
          font: { weight: "bold", size: 14 }
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      }
    },
    interaction: {
      intersect: false,
      mode: "index"
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart"
    }
  };

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 3, display: "flex", alignItems: "center" }}
      >
        ⛰️ Elevation Profile Analyzer
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000} // 3 seconds
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />

          {/* Controls */}
          {/* Modern Controls */}
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              background: "linear-gradient(135deg, #fef3c7 0%, #fef7cd 100%)"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2
                }}
              >
                <TerrainIcon sx={{ color: "white", fontSize: "1.2rem" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1a202c" }}
              >
                Route Controls
              </Typography>
            </Box>

            <Stack spacing={2.5}>
              <Button
                variant={drawing ? "outlined" : "contained"}
                color={drawing ? "error" : "primary"}
                startIcon={drawing ? <StopIcon /> : <PlayArrowIcon />}
                onClick={() => {
                  setDrawing(!drawing);
                  if (!drawing) clearMap();
                }}
                size="large"
                fullWidth
                sx={{
                  borderRadius: 2.5,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  ...(drawing
                    ? {
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        "&:hover": {
                          borderColor: "#dc2626",
                          backgroundColor: "rgba(239, 68, 68, 0.15)"
                        }
                      }
                    : {
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        boxShadow: "0 8px 25px -8px rgba(59, 130, 246, 0.5)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          boxShadow: "0 12px 35px -8px rgba(59, 130, 246, 0.7)",
                          transform: "translateY(-2px)"
                        }
                      }),
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {drawing ? "Stop Drawing Route" : "Start Drawing Route"}
              </Button>

              <LoadingButton
                variant="contained"
                startIcon={<TrendingUpIcon />}
                loading={isGenerating}
                disabled={elevationPoints.length < 2}
                onClick={generateProfile}
                size="large"
                fullWidth
                sx={{
                  borderRadius: 2.5,
                  py: 1.5,
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  boxShadow: "0 8px 25px -8px rgba(139, 92, 246, 0.5)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    boxShadow: "0 12px 35px -8px rgba(139, 92, 246, 0.7)",
                    transform: "translateY(-2px)"
                  },
                  "&:disabled": {
                    background: "#e2e8f0",
                    color: "#64748b"
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                Generate Elevation Profile
              </LoadingButton>

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearMap}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    borderColor: "#f59e0b",
                    color: "#f59e0b",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      borderColor: "#d97706",
                      backgroundColor: "rgba(245, 158, 11, 0.08)",
                      transform: "translateY(-1px)"
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  Clear All
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={!highPoint}
                  onClick={() => setSaveDialogOpen(true)}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 6px 20px -6px rgba(16, 185, 129, 0.4)",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      boxShadow: "0 8px 25px -6px rgba(16, 185, 129, 0.6)",
                      transform: "translateY(-1px)"
                    },
                    "&:disabled": {
                      background: "#e2e8f0",
                      color: "#64748b"
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  Save Route
                </Button>
              </Box>
            </Stack>
          </Card>

          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2
                }}
              >
                <LocationOnIcon sx={{ color: "white", fontSize: "1.2rem" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1a202c" }}
              >
                Manual Coordinates
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  id="lat-input"
                  label="Latitude"
                  variant="outlined"
                  size="medium"
                  fullWidth
                  placeholder="e.g. 28.6139"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10b981"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10b981"
                      }
                    }
                  }}
                />
                <TextField
                  id="lng-input"
                  label="Longitude"
                  variant="outlined"
                  size="medium"
                  fullWidth
                  placeholder="e.g. 77.2090"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10b981"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10b981"
                      }
                    }
                  }}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<LocationOnIcon />}
                size="large"
                onClick={() => {
                  const lat = parseFloat(
                    document.getElementById("lat-input").value
                  );
                  const lng = parseFloat(
                    document.getElementById("lng-input").value
                  );

                  if (isNaN(lat) || isNaN(lng)) {
                    showSnackbar("Invalid coordinates", "error");
                    return;
                  }

                  const position = { lat, lng };

                  if (!isInsideIndia(position)) {
                    showSnackbar("Coordinates must be inside India", "warning");
                    return;
                  }

                  const label = String.fromCharCode(
                    65 + elevationPoints.length
                  );

                  const marker = new window.google.maps.Marker({
                    position,
                    map,
                    label: String.fromCharCode(65 + elevationPoints.length),
                    animation: window.google.maps.Animation.DROP
                  });

                  const newPoints = [...elevationPoints, position];
                  const newMarkers = [...markers, marker];

                  setMarkers(newMarkers);
                  setElevationPoints(newPoints);
                  map.panTo(position);

                  if (polyline) polyline.setMap(null);
                  if (newPoints.length > 1) {
                    const pl = new window.google.maps.Polyline({
                      path: newPoints,
                      map: map,
                      strokeColor: theme.palette.primary.main,
                      strokeWeight: 4,
                      strokeOpacity: 0.8
                    });
                    setPolyline(pl);
                  }

                  showSnackbar(
                    `Marker ${label} added by coordinates`,
                    "success"
                  );
                }}
                sx={{
                  borderRadius: 2.5,
                  py: 1.5,
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 8px 25px -8px rgba(16, 185, 129, 0.5)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 12px 35px -8px rgba(16, 185, 129, 0.7)",
                    transform: "translateY(-2px)"
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                Add Point to Route
              </Button>
            </Stack>
          </Card>

          {/* Modern Statistics */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden"
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                p: 2,
                borderBottom: "1px solid #e2e8f0"
              }}
            >
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                Route Statistics
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                    border: "1px solid rgba(59, 130, 246, 0.2)"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Typography sx={{ color: "#1e40af", fontWeight: 500 }}>
                      Total Distance
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#1e40af"
                      }}
                    >
                      {totalDistance.toFixed(2)} km
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
                    border: "1px solid rgba(139, 92, 246, 0.2)"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Typography sx={{ color: "#7c3aed", fontWeight: 500 }}>
                      Route Points
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#7c3aed"
                      }}
                    >
                      {elevationPoints.length}
                    </Typography>
                  </Box>
                </Paper>

                {highPoint && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                      border: "1px solid rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          H
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "#047857" }}
                      >
                        Highest Point
                      </Typography>
                    </Box>

                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography variant="body2">Elevation:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {highPoint.elevation.toFixed(0)} m
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography variant="body2">Coordinates:</Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ fontFamily: "monospace" }}
                        >
                          {highPoint.lat.toFixed(4)}, {highPoint.lng.toFixed(4)}
                        </Typography>
                      </Box>

                      {elevationPoints[0] && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography variant="body2">
                            Distance from A:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {calculateDistance(
                              elevationPoints[0],
                              highPoint
                            ).toFixed(2)}{" "}
                            km
                          </Typography>
                        </Box>
                      )}
                      {elevationPoints[1] && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography variant="body2">
                            Distance from B:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {calculateDistance(
                              elevationPoints[1],
                              highPoint
                            ).toFixed(2)}{" "}
                            km
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}

                {lowPoint && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #ef4444, #dc2626)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          L
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "#dc2626" }}
                      >
                        Lowest Point
                      </Typography>
                    </Box>

                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography variant="body2">Elevation:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {lowPoint.elevation.toFixed(0)} m
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography variant="body2">Coordinates:</Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ fontFamily: "monospace" }}
                        >
                          {lowPoint.lat.toFixed(4)}, {lowPoint.lng.toFixed(4)}
                        </Typography>
                      </Box>

                      {elevationPoints[0] && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography variant="body2">
                            Distance from A:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {calculateDistance(
                              elevationPoints[0],
                              lowPoint
                            ).toFixed(2)}{" "}
                            km
                          </Typography>
                        </Box>
                      )}
                      {elevationPoints[1] && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography variant="body2">
                            Distance from B:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {calculateDistance(
                              elevationPoints[1],
                              lowPoint
                            ).toFixed(2)}{" "}
                            km
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}

                {highPoint && lowPoint && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)",
                      border: "1px solid rgba(245, 158, 11, 0.3)"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <Typography sx={{ color: "#d97706", fontWeight: 500 }}>
                        Elevation Gain
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: "#d97706"
                        }}
                      >
                        {(highPoint.elevation - lowPoint.elevation).toFixed(0)}{" "}
                        m
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Chart + Records */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              mb: 4,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden"
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                p: 3,
                borderBottom: "1px solid #e2e8f0"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TimelineIcon sx={{ color: "white", mr: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  Elevation Profile Chart
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}
              >
                Interactive elevation visualization along your route
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              {elevationProfile.length > 0 ? (
                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Line data={chartData} options={chartOptions} />
                </Box>
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3
                    }}
                  >
                    <TimelineIcon
                      sx={{ fontSize: "2.5rem", color: "#9ca3af" }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "#6b7280", mb: 1, fontWeight: 500 }}
                  >
                    No Elevation Data
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                    Add at least 2 points and generate the profile to see the
                    elevation chart
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Saved Records Table */}
          <Card sx={{ p: 2, borderRadius: 4, boxShadow: 4 }}>
            <Typography variant="h6" gutterBottom>
              Saved Records
            </Typography>
            {savedData.length === 0 ? (
              <Typography>No records saved</Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 400, // limit height
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
                  "-ms-overflow-style": "none", // IE/Edge
                  "scrollbar-width": "none" // Firefox
                }}
              >
                <Table sx={{ minWidth: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Total Distance (km)</TableCell>
                      <TableCell>Elevation Gain (m)</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedData.map((record, idx) => (
                      <TableRow
                        key={record.id}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        <TableCell>
                          {new Date(record.savedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{record.totalDistance.toFixed(2)}</TableCell>
                        <TableCell>{record.elevationGain.toFixed(0)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => showSavedPoints(record)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => confirmDelete(idx)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Elevation Data</DialogTitle>
        <DialogContent>
          <Typography>Points: {elevationPoints.length}</Typography>
          {highPoint && (
            <Typography>Highest: {highPoint.elevation.toFixed(0)} m</Typography>
          )}
          {lowPoint && (
            <Typography>Lowest: {lowPoint.elevation.toFixed(0)} m</Typography>
          )}
          <Typography>Total Distance: {totalDistance.toFixed(2)} km</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={saveStats}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, index: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, index: null })}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={deleteRecord}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
