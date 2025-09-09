/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Stack,
  Alert,
  Fade,
  CircularProgress,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  Grow,
  Zoom,
  keyframes,
} from "@mui/material";
import {
  Map as MapIcon,
  Public as PublicIcon,
  LocationCity as LocationCityIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Layers as LayersIcon,
  FilterAlt as FilterIcon,
  Place as PlaceIcon,
  AccountTree as TreeIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { wrap } from "framer-motion";

export default function BoundariesTab({ map }) {
  const [indiaPolygons, setIndiaPolygons] = useState([]);
  const [boundaryVisible, setBoundaryVisible] = useState(false);

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");

  const [statePolygons, setStatePolygons] = useState([]);
  const [districtPolygons, setDistrictPolygons] = useState([]);
  const [subdistrictPolygons, setSubdistrictPolygons] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = {
    STATE: "#3cba54",
    DISTRICT: "#4287f5",
    SUBDISTRICT: "#f4c20d",
  };

  // Convert coordinates: handles both Polygon & MultiPolygon
  const convertCoords = (geometry) => {
    if (geometry.type === "Polygon") {
      return geometry.coordinates.map((ring) =>
        ring.map((c) => ({ lat: c[1], lng: c[0] }))
      );
    } else if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.flatMap((polygon) =>
        polygon.map((ring) => ring.map((c) => ({ lat: c[1], lng: c[0] })))
      );
    }
    return [];
  };

  // Load India boundaries
  useEffect(() => {
    if (!map) return;
    setLoading(true);
    fetch("/india.json")
      .then((res) => res.json())
      .then((data) => {
        const polygons = [];
        const stateNames = [];
        data.features.forEach((f) => {
          stateNames.push(f.properties.st_nm);
          convertCoords(f.geometry).forEach((paths) => {
            polygons.push(
              new window.google.maps.Polygon({
                paths,
                strokeColor: "darkred",
                strokeWeight: 2,
                fillColor: "teal",
                fillOpacity: 0.1,
                map: null,
              })
            );
          });
        });
        setIndiaPolygons(polygons);
        setStates(stateNames.sort());
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load India boundaries");
        setLoading(false);
      });
  }, [map]);

  const toggleIndiaBoundary = () => {
    indiaPolygons.forEach((p) => p.setMap(boundaryVisible ? null : map));
    setBoundaryVisible(!boundaryVisible);
  };

  const resetAllBoundaries = () => {
    setLoading(true);

    // Hide all polygons
    [
      ...indiaPolygons,
      ...statePolygons,
      ...districtPolygons.map((d) => d.poly),
      ...subdistrictPolygons.map((s) => s.poly),
    ].forEach((p) => p.setMap(null));

    // Clear selections
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedSubdistrict("");

    // Clear arrays
    setStatePolygons([]);
    setDistrictPolygons([]);
    setSubdistrictPolygons([]);
    setBoundaryVisible(false);

    if (map) {
      map.setCenter({ lat: 22.5, lng: 78.9 });
      map.setZoom(5);
    }

    setTimeout(() => setLoading(false), 500);
  };

  // Map state name to file prefix (must match your JSON filenames)
  const STATE_FILES = {
    Gujarat: "GUJARAT",
    Maharashtra: "MAHARASHTRA",
    "Andaman & Nicobar": "ANDAMAN & NICOBAR",
    "Andhra Pradesh": "ANDHRA PRADESH",
    "Arunachal Pradesh": "ARUNACHAL PRADESH",
    Assam: "ASSAM",
    Bihar: "BIHAR",
    Chandigarh: "CHANDIGARH",
    "Dadra & Nagar Haveli": "CHHATTISGARH",
    "Daman & Diu": "DAMAN & DIU",
    Delhi: "DELHI",
    Goa: "GOA",
    Haryana: "HARYANA",
    "Himachal Pradesh": "HIMACHAL PRADESH",
    "Jammu & Kashmir": "JAMMU & KASHMIR",
    Jharkhand: "JHARKHAND",
    Karnataka: "KARNATAKA",
    Kerala: "KERALA",
    Ladakh: "LADAKH",
    Lakshadweep: "LAKSHADWEEP",
    "Madhya Pradesh": "MADHYA PRADESH",
    Manipur: "MANIPUR",
    Meghalaya: "MEGHALAYA",
    Mizoram: "MIZORAM",
    Nagaland: "NAGALAND",
    Odisha: "ODISHA",
    Puducherry: "PUDUCHERRY",
    Punjab: "PUNJAB",
    Rajasthan: "RAJASTHAN",
    Sikkim: "SIKKIM",
    Tamilnadu: "TAMILNADU", // ✅ handled below
    Telangana: "TELANGANA",
    Tripura: "TRIPURA",
    "Uttar Pradesh": "UTTAR PRADESH",
    Uttarakhand: "UTTARAKHAND",
    "West Bengal": "WEST BENGAL",
  };

  // Show selected state and load its district & subdistrict boundaries
  const showStatePolygon = (stateName) => {
    if (!map || !stateName) return;

    // Hide old polygons
    [
      ...statePolygons,
      ...districtPolygons.map((d) => d.poly),
      ...subdistrictPolygons.map((s) => s.poly),
    ].forEach((p) => p.setMap(null));

    setDistricts([]);
    setSubdistricts([]);
    setDistrictPolygons([]);
    setSubdistrictPolygons([]);
    setStatePolygons([]);

    const prefix = STATE_FILES[stateName];
    if (!prefix) return;

    // ✅ Get state boundary from india.json
    fetch("/india.json")
      .then((res) => res.json())
      .then((data) => {
        const stateFeature = data.features.find(
          (f) => f.properties.st_nm === stateName
        );
        if (!stateFeature) return;

        const statePolys = convertCoords(stateFeature.geometry).map(
          (paths) =>
            new window.google.maps.Polygon({
              paths,
              strokeColor: COLORS.STATE,
              strokeWeight: 3,
              fillColor: COLORS.STATE,
              fillOpacity: 0.1,
              map: map, // show immediately
            })
        );

        setStatePolygons(statePolys);

        // Auto zoom to state
        const bounds = new window.google.maps.LatLngBounds();
        statePolys.forEach((poly) =>
          poly.getPath().forEach((latlng) => bounds.extend(latlng))
        );
        if (!bounds.isEmpty()) map.fitBounds(bounds);
      });

    // ---- Fetch Districts ----
    const districtFile =
      stateName === "Tamilnadu"
        ? "TAMIL NADU_DISTRICTS.geojson"
        : `${prefix}_DISTRICTS.geojson`;

    fetch(`/${districtFile}`)
      .then((res) => res.json())
      .then((dData) => {
        const sortedDist = dData.features.sort((a, b) =>
          (a.properties.dtname || a.properties.name).localeCompare(
            b.properties.dtname || b.properties.name
          )
        );
        setDistricts(
          sortedDist.map((d) => d.properties.dtname || d.properties.name)
        );
        setDistrictPolygons(
          sortedDist.flatMap((d) =>
            convertCoords(d.geometry).map((paths) => ({
              name: d.properties.dtname || d.properties.name,
              poly: new window.google.maps.Polygon({
                paths,
                strokeColor: COLORS.DISTRICT,
                strokeWeight: 2,
                fillColor: COLORS.DISTRICT,
                fillOpacity: 0.2,
                map: null,
              }),
            }))
          )
        );
      });

    // ---- Fetch Subdistricts ----
    const subdistrictFile = `${prefix}_SUBDISTRICTS.geojson`;
    fetch(`/${subdistrictFile}`)
      .then((res) => res.json())
      .then((subData) => {
        const sortedSub = subData.features.sort((a, b) =>
          (a.properties.sdtname || a.properties.name).localeCompare(
            b.properties.sdtname || b.properties.name
          )
        );
        setSubdistricts(
          sortedSub.map((f) => f.properties.sdtname || f.properties.name)
        );
        setSubdistrictPolygons(
          sortedSub.flatMap((f) =>
            convertCoords(f.geometry).map((paths) => ({
              name: f.properties.sdtname || f.properties.name,
              poly: new window.google.maps.Polygon({
                paths,
                strokeColor: COLORS.SUBDISTRICT,
                strokeWeight: 1.5,
                fillColor: COLORS.SUBDISTRICT,
                fillOpacity: 0.2,
                map: null,
              }),
            }))
          )
        );
      });
  };

  useEffect(() => {
    districtPolygons.forEach(({ poly }) => poly.setMap(null));
    if (!selectedDistrict) return;
    const match = districtPolygons.filter((d) => d.name === selectedDistrict);
    const highlightPolys = match.map((d) => {
      d.poly.setMap(map);
      d.poly.setOptions({ fillOpacity: 0.6, strokeWeight: 3 });
      return d.poly;
    });
    const bounds = new window.google.maps.LatLngBounds();
    highlightPolys.forEach((poly) =>
      poly.getPath().forEach((latlng) => bounds.extend(latlng))
    );
    if (highlightPolys.length) map.fitBounds(bounds);
  }, [selectedDistrict]);

  useEffect(() => {
    subdistrictPolygons.forEach(({ poly }) => poly.setMap(null));
    if (!selectedSubdistrict) return;
    const match = subdistrictPolygons.filter(
      (d) => d.name === selectedSubdistrict
    );
    const highlightPolys = match.map((d) => {
      d.poly.setMap(map);
      d.poly.setOptions({ fillOpacity: 0.6, strokeWeight: 3 });
      return d.poly;
    });
    const bounds = new window.google.maps.LatLngBounds();
    highlightPolys.forEach((poly) =>
      poly.getPath().forEach((latlng) => bounds.extend(latlng))
    );
    if (highlightPolys.length) map.fitBounds(bounds);
  }, [selectedSubdistrict]);

  // Get stats for display
  const getStats = () => ({
    totalStates: states.length,
    totalDistricts: districts.length,
    totalSubdistricts: subdistricts.length,
    activePolygons: [
      ...statePolygons,
      ...districtPolygons.map((d) => d.poly).filter((p) => p.getMap()),
      ...subdistrictPolygons.map((s) => s.poly).filter((p) => p.getMap()),
    ].length,
  });

  const stats = getStats();

  return (
    <Box sx={{ p: 0 }}>
      {/* Loading Progress */}
      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 2 }} />
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Header */}
      <Box>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "#1565c0" }}
        >
          🗺️ Administrative Boundaries
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore and visualize administrative boundaries across different
          levels
        </Typography>
      </Box>

      {/* Stats Cards
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "white", fontWeight: 700 }}
                  >
                    {stats.totalStates}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    States Available
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <PublicIcon sx={{ color: "white" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "white", fontWeight: 700 }}
                  >
                    {stats.totalDistricts}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Districts
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <LocationCityIcon sx={{ color: "white" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "white", fontWeight: 700 }}
                  >
                    {stats.totalSubdistricts}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Subdistricts
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <HomeIcon sx={{ color: "white" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "white", fontWeight: 700 }}
                  >
                    {stats.activePolygons}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Active Layers
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <LayersIcon sx={{ color: "white" }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Control Panel */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid",
          borderColor: alpha("#1976d2", 0.1),
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 40%, ${alpha(
              "#1976d2",
              0.04
            )} 0%, transparent 60%),
                   radial-gradient(circle at 70% 20%, ${alpha(
                     "#4caf50",
                     0.04
                   )} 0%, transparent 60%)`,
            pointerEvents: "none",
          },
        }}
      >
        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: "#1a202c",
              display: "flex",
              alignItems: "center",
              fontSize: "1.3rem",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 3,
                boxShadow: "0 8px 25px -8px rgba(25, 118, 210, 0.4)",
              }}
            >
              <SettingsIcon sx={{ color: "white", fontSize: "1.4rem" }} />
            </Box>
            Boundary Controls
            <Chip
              label={`${stats.activePolygons} Active`}
              size="small"
              sx={{
                ml: 2,
                background:
                  stats.activePolygons > 0
                    ? "linear-gradient(135deg, #4caf50, #388e3c)"
                    : "linear-gradient(135deg, #9e9e9e, #757575)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Typography>

          <Stack spacing={3}>
            {/* Primary Boundary Controls */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 3,
                  color: "#64748b",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: "0.85rem",
                }}
              >
                Primary Controls
              </Typography>

              <Stack direction="row" spacing={3} flexWrap="wrap">
                {/* Show/Hide India Boundary Button */}
                <Grow in timeout={400}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      loading ? (
                        <CircularProgress
                          size={20}
                          color="inherit"
                          thickness={6}
                        />
                      ) : boundaryVisible ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )
                    }
                    onClick={toggleIndiaBoundary}
                    disabled={loading}
                    sx={{
                      borderRadius: 3.5,
                      px: 5,
                      py: 1.8,
                      minWidth: 200,
                      background: boundaryVisible
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow: boundaryVisible
                        ? "0 10px 30px -8px rgba(239, 68, 68, 0.5)"
                        : "0 10px 30px -8px rgba(16, 185, 129, 0.5)",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        background: boundaryVisible
                          ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                          : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        boxShadow: boundaryVisible
                          ? "0 15px 40px -8px rgba(239, 68, 68, 0.7)"
                          : "0 15px 40px -8px rgba(16, 185, 129, 0.7)",
                        transform: "translateY(-3px)",
                      },
                      "&:disabled": {
                        background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                        color: "#64748b",
                        boxShadow: "none",
                        transform: "none",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                        transition: "left 0.6s",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                      // Pulsing effect when boundary is visible
                      ...(boundaryVisible && {
                        animation: "pulse 3s infinite",
                        "@keyframes pulse": {
                          "0%": {
                            boxShadow:
                              "0 10px 30px -8px rgba(239, 68, 68, 0.5)",
                          },
                          "50%": {
                            boxShadow:
                              "0 15px 40px -5px rgba(239, 68, 68, 0.8)",
                          },
                          "100%": {
                            boxShadow:
                              "0 10px 30px -8px rgba(239, 68, 68, 0.5)",
                          },
                        },
                      }),
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {boundaryVisible ? "Hide" : "Show"} All State Boundary
                      {boundaryVisible && (
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            background: "rgba(255,255,255,0.3)",
                            color: "white",
                            border: "1px solid rgba(255,255,255,0.4)",
                          }}
                        />
                      )}
                    </Box>
                  </Button>
                </Grow>

                {/* Reset All Boundaries Button */}
                <Grow in timeout={600}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={
                      loading ? (
                        <CircularProgress
                          size={20}
                          color="inherit"
                          thickness={6}
                        />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                    onClick={resetAllBoundaries}
                    disabled={
                      loading ||
                      (!boundaryVisible &&
                        !selectedState &&
                        !selectedDistrict &&
                        !selectedSubdistrict)
                    }
                    sx={{
                      borderRadius: 3.5,
                      px: 5,
                      py: 1.8,
                      minWidth: 200,
                      borderWidth: 2.5,
                      borderColor: "#f59e0b",
                      color: "#f59e0b",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      backgroundColor: "transparent",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        borderColor: "#d97706",
                        backgroundColor: alpha("#f59e0b", 0.12),
                        color: "#d97706",
                        transform: "translateY(-3px)",
                        boxShadow: "0 12px 35px -8px rgba(245, 158, 11, 0.4)",
                      },
                      "&:disabled": {
                        borderColor: "#e2e8f0",
                        color: "#94a3b8",
                        backgroundColor: "transparent",
                        transform: "none",
                        boxShadow: "none",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent)",
                        transition: "left 0.6s",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Reset All Boundaries
                      {(boundaryVisible ||
                        selectedState ||
                        selectedDistrict ||
                        selectedSubdistrict) && (
                        <Chip
                          label={`${stats.activePolygons} layers`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            background: alpha("#f59e0b", 0.2),
                            color: "#d97706",
                            border: `1px solid ${alpha("#f59e0b", 0.3)}`,
                          }}
                        />
                      )}
                    </Box>
                  </Button>
                </Grow>
              </Stack>
            </Box>

            {/* Quick Action Hints */}
            {/* <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  color: "#64748b",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: "0.8rem",
                }}
              >
                Quick Tips
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  border: "1px solid",
                  borderColor: alpha("#0ea5e9", 0.2),
                  borderRadius: 3,
                }}
              >
                <List dense sx={{ py: 0 }}>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <VisibilityIcon
                          sx={{ color: "white", fontSize: "1rem" }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary="Show India Boundary"
                      secondary="Toggle the complete outline of India with state borders"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                      secondaryTypographyProps={{
                        fontSize: "0.8rem",
                        color: "#64748b",
                      }}
                    />
                  </ListItem>

                  <Divider
                    sx={{ my: 1.5, borderColor: alpha("#0ea5e9", 0.1) }}
                  />

                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #f59e0b, #d97706)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <RefreshIcon
                          sx={{ color: "white", fontSize: "1rem" }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary="Reset All Boundaries"
                      secondary="Clear all boundary layers and return to default India view"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                      secondaryTypographyProps={{
                        fontSize: "0.8rem",
                        color: "#64748b",
                      }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box> */}

            {/* Status Indicator */}
            {(boundaryVisible ||
              selectedState ||
              selectedDistrict ||
              selectedSubdistrict) && (
              <Zoom in timeout={300}>
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    backgroundColor: alpha("#2196f3", 0.04),
                    borderColor: alpha("#2196f3", 0.2),
                    "& .MuiAlert-icon": {
                      color: "#2196f3",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Active Layers: {stats.activePolygons} boundary layer
                    {stats.activePolygons !== 1 ? "s" : ""} currently displayed
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Use "Reset All Boundaries" to clear the map view
                  </Typography>
                </Alert>
              </Zoom>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Selection Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}
          >
            <FilterIcon sx={{ mr: 1, color: "#1976d2" }} />
            Administrative Level Selection
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* State Selection */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ display: "flex", alignItems: "center" }}>
                  <PublicIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Select State
                </InputLabel>
                <Select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    showStatePolygon(e.target.value);
                  }}
                  label="Select State"
                  sx={{
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300, // still keeps list scrollable
                        "&::-webkit-scrollbar": { display: "none" }, // hides scrollbar in WebKit
                        "-ms-overflow-style": "none", // IE & Edge
                        scrollbarWidth: "none", // Firefox
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>-- Choose State --</em>
                  </MenuItem>
                  {states.map((s) => (
                    <MenuItem
                      key={s}
                      value={s}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <PublicIcon
                        sx={{ mr: 1, fontSize: "1rem", color: COLORS.STATE }}
                      />
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* District Selection */}
            {districts.length > 0 && (
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ display: "flex", alignItems: "center" }}>
                    <LocationCityIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                    Select District
                  </InputLabel>
                  <Select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    label="Select District"
                    sx={{
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300, // keep dropdown scrollable but limit height
                          "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
                          "-ms-overflow-style": "none", // IE & Edge
                          scrollbarWidth: "none", // Firefox
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>-- Choose District --</em>
                    </MenuItem>
                    {districts.map((d, idx) => (
                      <MenuItem
                        key={`${d}-${idx}`} // ensures uniqueness even if names repeat
                        value={d}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <LocationCityIcon
                          sx={{
                            mr: 1,
                            fontSize: "1rem",
                            color: COLORS.DISTRICT,
                          }}
                        />
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Subdistrict Selection */}
            {subdistricts.length > 0 && (
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ display: "flex", alignItems: "center" }}>
                    <HomeIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                    Select Subdistrict
                  </InputLabel>
                  <Select
                    value={selectedSubdistrict}
                    onChange={(e) => setSelectedSubdistrict(e.target.value)}
                    label="Select Subdistrict"
                    sx={{
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          "&::-webkit-scrollbar": { display: "none" },
                          "-ms-overflow-style": "none",
                          scrollbarWidth: "none",
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>-- Choose Subdistrict --</em>
                    </MenuItem>
                    {subdistricts.map((s, idx) => (
                      <MenuItem
                        key={`${s}-${idx}`} // ensures uniqueness even if names repeat
                        value={s}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <HomeIcon
                          sx={{
                            mr: 1,
                            fontSize: "1rem",
                            color: COLORS.SUBDISTRICT,
                          }}
                        />
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Layer Status Panel */}
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}
          >
            <LayersIcon sx={{ mr: 1, color: "#1976d2" }} />
            Active Layers Status
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: boundaryVisible
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(0, 0, 0, 0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  {boundaryVisible ? (
                    <CheckCircleIcon sx={{ color: "#4caf50", mr: 1 }} />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{ color: "#9e9e9e", mr: 1 }}
                    />
                  )}
                  <PublicIcon
                    sx={{ color: boundaryVisible ? "#4caf50" : "#9e9e9e" }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color={boundaryVisible ? "success.main" : "text.secondary"}
                >
                  India Boundary
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: selectedState
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(0, 0, 0, 0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  {selectedState ? (
                    <CheckCircleIcon sx={{ color: COLORS.STATE, mr: 1 }} />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{ color: "#9e9e9e", mr: 1 }}
                    />
                  )}
                  <PublicIcon
                    sx={{ color: selectedState ? COLORS.STATE : "#9e9e9e" }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color={selectedState ? "text.primary" : "text.secondary"}
                >
                  {selectedState || "State Layer"}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: selectedDistrict
                    ? "rgba(33, 150, 243, 0.1)"
                    : "rgba(0, 0, 0, 0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  {selectedDistrict ? (
                    <CheckCircleIcon sx={{ color: COLORS.DISTRICT, mr: 1 }} />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{ color: "#9e9e9e", mr: 1 }}
                    />
                  )}
                  <LocationCityIcon
                    sx={{
                      color: selectedDistrict ? COLORS.DISTRICT : "#9e9e9e",
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color={selectedDistrict ? "text.primary" : "text.secondary"}
                >
                  {selectedDistrict || "District Layer"}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: selectedSubdistrict
                    ? "rgba(255, 152, 0, 0.1)"
                    : "rgba(0, 0, 0, 0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  {selectedSubdistrict ? (
                    <CheckCircleIcon
                      sx={{ color: COLORS.SUBDISTRICT, mr: 1 }}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{ color: "#9e9e9e", mr: 1 }}
                    />
                  )}
                  <HomeIcon
                    sx={{
                      color: selectedSubdistrict
                        ? COLORS.SUBDISTRICT
                        : "#9e9e9e",
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color={
                    selectedSubdistrict ? "text.primary" : "text.secondary"
                  }
                >
                  {selectedSubdistrict || "Subdistrict Layer"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Legend */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "rgba(0, 0, 0, 0.02)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Color Legend:
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: "teal",
                    mr: 1,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">India Boundary</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: COLORS.STATE,
                    mr: 1,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">State Boundary</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: COLORS.DISTRICT,
                    mr: 1,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">District Boundary</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: COLORS.SUBDISTRICT,
                    mr: 1,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">Subdistrict Boundary</Typography>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
