// import { Box } from "@mui/material";
// import { useEffect } from "react";
// import Sidebar from "./4.2 Sidebar/4.2 SidebarMain";
// import useGoogleMapWithIndia from "../../../hooks/useGoogleMapWithIndia";
// import useRegionAccess from "../../../hooks/useRegionAccess";

// export default function AllToolContainer({ userData = {} }) {
//   const allowedRegions = userData.regions || [];

//   // 1️⃣ Init map
//   const { mapRef, map, loaded } = useGoogleMapWithIndia({
//     apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY, // ✅ works in Vite
//   });

//   // 2️⃣ Apply region access
//   const { ready, fitMapToAllowedRegions, allowedStateNames } = useRegionAccess(
//     map,
//     userData.username || userData.id
//   );

//   // 3️⃣ Auto-zoom once both are ready
//   useEffect(() => {
//     if (map && ready) {
//       fitMapToAllowedRegions();
//     }
//   }, [map, ready, fitMapToAllowedRegions]);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         height: "100vh",
//         width: "100%",
//         overflow: "hidden",
//       }}
//     >
//       {/* Sidebar */}
//       <Sidebar regions={allowedRegions} />

//       {/* Map container */}
//       <Box
//         ref={mapRef}
//         sx={{
//           flex: 1,
//           minWidth: 0,
//           height: "100%",
//         }}
//       />
//     </Box>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Snackbar,
  Alert,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Breadcrumbs,
  Link,
  CircularProgress,
  Skeleton,
  Backdrop,
  Autocomplete,
  Grid,
  Stack,
  useTheme,
  alpha
} from "@mui/material";
import {
  Menu as MenuIcon,
  Map as MapIcon,
  Search as SearchIcon,
  ZoomIn,
  ZoomOut,
  PanTool,
  CropFree,
  Timeline,
  Straighten,
  Business,
  Terrain,
  Place,
  Layers,
  Save,
  Upload,
  Download,
  Settings,
  Visibility,
  VisibilityOff,
  ExpandMore,
  MyLocation,
  Fullscreen,
  Home,
  Navigation,
  Palette,
  FilterAlt,
  GridOn,
  Share,
  Print,
  Help,
  History,
  Bookmark,
  BookmarkBorder,
  Notifications,
  DarkMode,
  LightMode,
  CloudSync,
  LocationOn,
  Speed,
  Info,
  Warning,
  Error,
  CheckCircle,
  Close,
  Refresh,
  Undo,
  Redo,
  ContentCopy,
  ViewList,
  ViewModule,
  Tune
} from "@mui/icons-material";
import useGoogleMapWithIndia from "../../../hooks/useGoogleMapWithIndia";
import useRegionAccess from "../../../hooks/useRegionAccess";
import MapSearchBox from "../../MapSearchBox";

export default function AllToolContainer({ userData = {} }) {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("pan");
  const [selectedBaseMap, setSelectedBaseMap] = useState("satellite");
  const [layersVisible, setLayersVisible] = useState({
    roads: true,
    buildings: true,
    terrain: false,
    boundaries: true,
    infrastructure: true
  });

  // New state for enhanced features
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({
    lat: 40.7589,
    lng: -73.9851,
    zoom: 12
  });
  const [actionHistory, setActionHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Dialog states
  const [measurementDialog, setMeasurementDialog] = useState(false);
  const [elevationPanel, setElevationPanel] = useState(false);
  const [infrastructureDialog, setInfrastructureDialog] = useState(false);
  const [selectedInfraType, setSelectedInfraType] = useState("");
  const [bookmarkDialog, setBookmarkDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);

  const drawerWidth = 340;

  const drawingTools = [
    { id: "pan", icon: PanTool, name: "Pan", color: "primary", shortcut: "P" },
    {
      id: "select",
      icon: CropFree,
      name: "Select",
      color: "secondary",
      shortcut: "S"
    },
    {
      id: "polygon",
      icon: Timeline,
      name: "Polygon",
      color: "success",
      shortcut: "G"
    },
    {
      id: "measure",
      icon: Straighten,
      name: "Measure",
      color: "warning",
      shortcut: "M"
    },
    {
      id: "infrastructure",
      icon: Business,
      name: "infra",
      color: "error",
      shortcut: "I"
    },
    {
      id: "elevation",
      icon: Terrain,
      name: "Elevation",
      color: "info",
      shortcut: "E"
    },
    {
      id: "marker",
      icon: Place,
      name: "Marker",
      color: "primary",
      shortcut: "K"
    }
  ];

  const baseMaps = [
    {
      id: "satellite",
      name: "Satellite",
      desc: "High-resolution satellite imagery",
      icon: "🛰️"
    },
    {
      id: "street",
      name: "Street Map",
      desc: "Detailed street and road network",
      icon: "🗺️"
    },
    {
      id: "terrain",
      name: "Terrain",
      desc: "Topographic and elevation data",
      icon: "🏔️"
    },
    {
      id: "hybrid",
      name: "Hybrid",
      desc: "Satellite with street labels",
      icon: "🌐"
    }
  ];

  const infrastructureTypes = [
    "Roads & Highways",
    "Buildings & Structures",
    "Bridges & Tunnels",
    "Power & Utilities",
    "Water Systems",
    "Railways & Transit",
    "Airports & Ports",
    "Telecommunications"
  ];

  const sampleSearchSuggestions = [
    "New York City",
    "Central Park",
    "Brooklyn Bridge",
    "Times Square",
    "Staten Island"
  ];

  const quickActions = [
    { icon: <Save />, name: "Save Project", color: "primary" },
    { icon: <Upload />, name: "Import Data", color: "secondary" },
    { icon: <Download />, name: "Export Map", color: "success" },
    { icon: <Share />, name: "Share Project", color: "info" },
    { icon: <Print />, name: "Print Map", color: "warning" }
  ];

  const { mapRef, map, loaded } = useGoogleMapWithIndia({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  const { ready, fitMapToAllowedRegions } = useRegionAccess(
    map,
    userData.username || userData.id
  );

  const handlePlaceSelect = (place) => {
    console.log("Selected place:", place);
  };

  // Effects
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    // Add initial notification
    addNotification("Welcome to GIS Professional", "success");
  }, []);

  // Enhanced handlers
  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    addNotification(`Switched to ${toolId} tool`, "info");
    addToHistory(`Tool changed to ${toolId}`);

    // Open relevant dialogs
    if (toolId === "measure") setMeasurementDialog(true);
    if (toolId === "elevation") setElevationPanel(true);
    if (toolId === "infrastructure") setInfrastructureDialog(true);
  };

  const toggleLayer = (layer) => {
    setLayersVisible((prev) => {
      const newState = { ...prev, [layer]: !prev[layer] };
      addNotification(
        `${layer} layer ${newState[layer] ? "enabled" : "disabled"}`,
        "success"
      );
      return newState;
    });
  };

  const addNotification = (message, severity = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const addToHistory = (action) => {
    setActionHistory((prev) => [...prev.slice(0, historyIndex + 1), action]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      addNotification("Action undone", "info");
    }
  };

  const handleRedo = () => {
    if (historyIndex < actionHistory.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      addNotification("Action redone", "info");
    }
  };

  const handleBookmark = () => {
    const bookmark = {
      id: Date.now(),
      name: `Bookmark ${bookmarks.length + 1}`,
      coords: currentCoords,
      timestamp: new Date().toLocaleString()
    };
    setBookmarks((prev) => [...prev, bookmark]);
    addNotification("Location bookmarked", "success");
  };

  const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(3)].map((_, i) => (
        <Card key={i} sx={{ mb: 2 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "grey.100" }}>
        <LinearProgress
          sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading GIS Professional...</Typography>
          <Typography variant="body2" color="text.secondary">
            Initializing map and region data
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: darkMode ? "grey.900" : "grey.100"
      }}
    >
      {/* Loading Backdrop */}
      <Backdrop open={mapLoading} sx={{ zIndex: 9999 }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="white">
            Processing...
          </Typography>
        </Box>
      </Backdrop>

      {/* Enhanced App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: darkMode ? "grey.900" : "primary.dark",
          backdropFilter: "blur(10px)"
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <MapIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GIS Dashboard
            <Chip
              label="Pro"
              size="small"
              color="success"
              sx={{ ml: 1, fontSize: "0.7rem" }}
            />
          </Typography>

          {/* Enhanced Search */}
          <Autocomplete
            freeSolo
            options={sampleSearchSuggestions}
            value={searchValue}
            onInputChange={(event, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Search locations..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{
                  mr: 2,
                  width: 300,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    "& fieldset": {
                      borderColor: alpha(theme.palette.common.white, 0.3)
                    },
                    "& input": { color: "white" },
                    "&:hover fieldset": {
                      borderColor: alpha(theme.palette.common.white, 0.5)
                    }
                  }
                }}
              />
            )}
            sx={{ mr: 2 }}
          />

          {/* Action Buttons */}
          <ButtonGroup variant="outlined" sx={{ mr: 1 }}>
            <Tooltip title="Undo (Ctrl+Z)">
              <Button
                startIcon={<Undo />}
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Undo
              </Button>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <Button
                startIcon={<Redo />}
                onClick={handleRedo}
                disabled={historyIndex >= actionHistory.length - 1}
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Redo
              </Button>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup variant="outlined" sx={{ mr: 1 }}>
            <Tooltip title="Import Data">
              <Button
                startIcon={<Upload />}
                onClick={() =>
                  addNotification("Import feature coming soon", "info")
                }
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Import
              </Button>
            </Tooltip>
            <Tooltip title="Export Map">
              <Button
                startIcon={<Download />}
                onClick={() =>
                  addNotification("Export feature coming soon", "info")
                }
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Save Project">
              <Button
                startIcon={<Save />}
                onClick={() =>
                  addNotification("Project saved successfully", "success")
                }
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Save
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle Theme">
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={() => setSettingsDialog(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Progress bar for loading operations */}
        {mapLoading && <LinearProgress />}
      </AppBar>

      {/* Enhanced Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: darkMode ? "grey.900" : "grey.50",
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`
          }
        }}
      >
        <Toolbar />

        {/* Breadcrumb Navigation */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: "0.8rem" }}>
            <Link underline="hover" color="inherit" href="#">
              Projects
            </Link>
            <Link underline="hover" color="inherit" href="#">
              Current Project
            </Link>
            <Typography color="text.primary" sx={{ fontSize: "0.8rem" }}>
              Map View
            </Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ p: 2, overflow: "auto", height: "100%" }}>
          {/* Quick Stats */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6">
                    {Object.values(layersVisible).filter(Boolean).length}
                  </Typography>
                  <Typography variant="caption">Active Layers</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6">{bookmarks.length}</Typography>
                  <Typography variant="caption">Bookmarks</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Enhanced Drawing Tools */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title="Drawing Tools"
              sx={{ pb: 1 }}
              titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
              action={
                <Tooltip title="Tool shortcuts available">
                  <IconButton size="small">
                    <Info />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1
                }}
              >
                {drawingTools.map((tool) => (
                  <Tooltip
                    key={tool.id}
                    title={`${tool.name} (${tool.shortcut})`}
                    placement="top"
                  >
                    <Button
                      variant={
                        activeTool === tool.id ? "contained" : "outlined"
                      }
                      color={tool.color}
                      startIcon={<tool.icon />}
                      onClick={() => handleToolChange(tool.id)}
                      fullWidth
                      size="small"
                      sx={{
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: 2
                        }
                      }}
                    >
                      {tool.name}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Enhanced Base Maps */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title="Base Maps"
              sx={{ pb: 1 }}
              titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
            />
            <CardContent sx={{ pt: 0 }}>
              <ToggleButtonGroup
                value={selectedBaseMap}
                exclusive
                onChange={(e, newMap) => {
                  if (newMap) {
                    setSelectedBaseMap(newMap);
                    setMapLoading(true);
                    setTimeout(() => setMapLoading(false), 1000);
                    addNotification(`Switched to ${newMap} view`, "success");
                  }
                }}
                aria-label="base map selection"
                orientation="vertical"
                fullWidth
                size="small"
              >
                {baseMaps.map((map) => (
                  <ToggleButton
                    key={map.id}
                    value={map.id}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%"
                      }}
                    >
                      <Typography sx={{ mr: 1 }}>{map.icon}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {map.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {map.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </CardContent>
          </Card>

          {/* Bookmarks Panel */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title="Bookmarks"
              sx={{ pb: 1 }}
              titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
              action={
                <Tooltip title="Add bookmark">
                  <IconButton size="small" onClick={handleBookmark}>
                    <BookmarkBorder />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {bookmarks.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No bookmarks yet
                </Typography>
              ) : (
                <List dense>
                  {bookmarks.slice(0, 3).map((bookmark) => (
                    <ListItemButton
                      key={bookmark.id}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemIcon>
                        <Bookmark color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={bookmark.name}
                        secondary={bookmark.timestamp}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Analysis Tools */}
          <Card>
            <CardHeader
              title="Analysis Tools"
              sx={{ pb: 1 }}
              titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
            />
            <CardContent sx={{ pt: 0 }}>
              <List dense>
                <ListItemButton
                  onClick={() => setMeasurementDialog(true)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon>
                    <Straighten color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Measure Distance"
                    secondary="Calculate distances and areas"
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => setElevationPanel(true)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon>
                    <Terrain color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Elevation Profile"
                    secondary="View terrain elevation"
                  />
                </ListItemButton>
                <ListItemButton sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemIcon>
                    <FilterAlt color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Spatial Analysis"
                    secondary="Advanced GIS analysis"
                  />
                </ListItemButton>
                <ListItemButton sx={{ borderRadius: 1 }}>
                  <ListItemIcon>
                    <Speed color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Performance Monitor"
                    secondary="Map rendering stats"
                  />
                </ListItemButton>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Drawer>

      {/* Enhanced Main Content */}
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

        {/* Map Container */}
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          {loaded && map && (
            <MapSearchBox map={map} onPlaceSelect={handlePlaceSelect} />
          )}

          {/* Map Element */}
          <Box
            ref={mapRef}
            sx={{
              flex: 1,
              minWidth: 0,
              height: "100%"
            }}
          />
        </Box>
      </Box>

      {/* Notification Snackbars */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={1000}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={notification.severity}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}

      {/* Measurement Dialog */}
      <Dialog
        open={measurementDialog}
        onClose={() => setMeasurementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Straighten color="primary" />
            Measurement Tool
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" paragraph>
              Click on the map to start measuring distances and areas.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="h6" color="primary">
                Results
              </Typography>
              <Typography variant="body2">Distance: 0 km</Typography>
              <Typography variant="body2">Area: 0 km²</Typography>
            </Paper>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} sx={{ mr: 1 }}>
                Reset
              </Button>
              <Button variant="contained" startIcon={<Save />}>
                Save Measurement
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeasurementDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Elevation Panel Dialog */}
      <Dialog
        open={elevationPanel}
        onClose={() => setElevationPanel(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Terrain color="success" />
            Elevation Profile
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Paper
              sx={{
                p: 2,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.50"
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Elevation chart will be displayed here
              </Typography>
            </Paper>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Chip label="Max: 1,234m" color="success" />
              <Chip label="Min: 45m" color="info" />
              <Chip label="Avg: 567m" color="primary" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Download />}>Export</Button>
          <Button onClick={() => setElevationPanel(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Infrastructure Dialog */}
      <Dialog
        open={infrastructureDialog}
        onClose={() => setInfrastructureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Business color="error" />
            Infrastructure Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Infrastructure Type</InputLabel>
              <Select
                value={selectedInfraType}
                onChange={(e) => setSelectedInfraType(e.target.value)}
                label="Infrastructure Type"
              >
                {infrastructureTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedInfraType && (
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="h6" gutterBottom>
                  {selectedInfraType} Analysis
                </Typography>
                <Typography variant="body2" paragraph>
                  Analysis results for {selectedInfraType} will be displayed
                  here.
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption">
                  Analysis Progress: 75%
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfrastructureDialog(false)}>Close</Button>
          <Button variant="contained" disabled={!selectedInfraType}>
            Start Analysis
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog}
        onClose={() => setSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Settings color="primary" />
            Settings
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Display Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMiniMap}
                      onChange={(e) => setShowMiniMap(e.target.checked)}
                    />
                  }
                  label="Show Mini Map"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Map Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography gutterBottom>Default Zoom Level</Typography>
                <Slider
                  value={currentCoords.zoom}
                  onChange={(e, newValue) =>
                    setCurrentCoords((prev) => ({ ...prev, zoom: newValue }))
                  }
                  min={1}
                  max={20}
                  marks
                  valueLabelDisplay="auto"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Performance</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Hardware Acceleration"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Smooth Animations"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setSettingsDialog(false);
              addNotification("Settings saved", "success");
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
