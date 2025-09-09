import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import {
  PanTool,
  CropFree,
  Timeline,
  Straighten,
  Business,
  Terrain,
  Place,
  Save,
  Upload,
  Download,
  Share,
  Print
} from "@mui/icons-material";
import useGoogleMapWithIndia from "../../../hooks/useGoogleMapWithIndia";
import useRegionAccess from "../../../hooks/useRegionAccess";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Import new modular components
import LoadingScreen from "./GISComponents/LoadingScreen";
import GISAppBar from "./GISComponents/GISAppBar";
import GISSidebar from "./GISComponents/GISSidebar";
import MapContainer from "./GISComponents/MapContainer";
import GISDialogs from "./GISComponents/GISDialogs";
import NotificationSystem from "./GISComponents/NotificationSystem";

export default function GISToolInterface({ userData = {}, logout }) {
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

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { user, loginTime } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: darkMode ? "grey.900" : "grey.100"
      }}
    >
      {/* App Bar */}
      <GISAppBar
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        sampleSearchSuggestions={sampleSearchSuggestions}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        historyIndex={historyIndex}
        actionHistory={actionHistory}
        notifications={notifications}
        setDarkMode={setDarkMode}
        setSettingsDialog={setSettingsDialog}
        addNotification={addNotification}
        mapLoading={mapLoading}
        user={user}
        loginTime={loginTime}
        handleLogout={handleLogout}
      />

      {/* Sidebar */}
      <GISSidebar
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
        drawerWidth={drawerWidth}
        layersVisible={layersVisible}
        bookmarks={bookmarks}
        drawingTools={drawingTools}
        baseMaps={baseMaps}
        activeTool={activeTool}
        selectedBaseMap={selectedBaseMap}
        handleToolChange={handleToolChange}
        setSelectedBaseMap={setSelectedBaseMap}
        setMapLoading={setMapLoading}
        addNotification={addNotification}
        handleBookmark={handleBookmark}
        setMeasurementDialog={setMeasurementDialog}
        setElevationPanel={setElevationPanel}
      />

      {/* Main Map Container */}
      <MapContainer
        sidebarOpen={sidebarOpen}
        drawerWidth={drawerWidth}
        darkMode={darkMode}
        userData={userData}
        addNotification={addNotification}
        quickActionsOpen={quickActionsOpen}
        setQuickActionsOpen={setQuickActionsOpen}
        quickActions={quickActions}
        onCoordsChange={(coords) => setCurrentCoords(coords)}
      />

      {/* All Dialogs */}
      <GISDialogs
        measurementDialog={measurementDialog}
        setMeasurementDialog={setMeasurementDialog}
        elevationPanel={elevationPanel}
        setElevationPanel={setElevationPanel}
        infrastructureDialog={infrastructureDialog}
        setInfrastructureDialog={setInfrastructureDialog}
        selectedInfraType={selectedInfraType}
        setSelectedInfraType={setSelectedInfraType}
        infrastructureTypes={infrastructureTypes}
        settingsDialog={settingsDialog}
        setSettingsDialog={setSettingsDialog}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showMiniMap={showMiniMap}
        setShowMiniMap={setShowMiniMap}
        currentCoords={currentCoords}
        setCurrentCoords={setCurrentCoords}
        addNotification={addNotification}
      />

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        setNotifications={setNotifications}
        mapLoading={mapLoading}
      />
    </Box>
  );
}
