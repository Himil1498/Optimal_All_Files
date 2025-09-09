import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Collapse,
  Fab
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useSearchParams } from "react-router-dom";
import MapSearchBox from "./MapSearchBox";

// Import tab components
import DistanceMeasurementTab from "../components/Tabs/DistanceMeasurementTab";
import PolygonDrawingTab from "../components/Tabs/PolygonDrawingTab";
import InfrastructureTab from "../components/Tabs/InfrastructureTab";
import ElevationTab from "../components/Tabs/ElevationTab";

import useGoogleMapWithIndia from "../hooks/useGoogleMapWithIndia";

export default function AllToolContainer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get("tab") || "0", 10);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // ✅ Initialize Google Map only once
  const { mapRef, map, loaded, error } = useGoogleMapWithIndia({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY, // secure key
    libraries: ["drawing", "geometry", "places"]
  });

  // Handle tab change and sync with URL
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue });
  };

  useEffect(() => {
    const tabFromUrl = parseInt(searchParams.get("tab") || "0", 10);
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleBack = () => navigate("/network");

  // Sidebar resizing
  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 240) newWidth = 240;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
    };
    const stopResizing = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  // Handle map search selection
  const handlePlaceSelect = (place) => {
    console.log("Selected place:", place);
    if (map && place.geometry?.location) {
      map.panTo(place.geometry.location);
      map.setZoom(14);
    }
  };

  return (
    <Box
      sx={{
        height: "90.8vh",
        width: "100vw",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#fafafa"
      }}
    >
      {/* Sidebar */}
      <Collapse in={sidebarOpen} orientation="horizontal" timeout={400}>
        <Box
          sx={{
            width: { xs: "100%", md: sidebarWidth },
            minWidth: { md: 400 },
            maxWidth: { md: 600 },
            height: { xs: "auto", md: "100%" },
            display: "flex",
            flexDirection: "column",
            borderRight: { md: "1px solid rgba(0,0,0,0.1)" },
            borderBottom: { xs: "1px solid rgba(0,0,0,0.1)", md: "none" },
            boxShadow: "4px 0 12px rgba(0,0,0,0.08)",
            backgroundColor: "white",
            position: "relative",
            zIndex: 20
          }}
        >
          {/* Header */}
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
            <IconButton size="small" color="primary" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, ml: 1, flex: 1 }}
            >
              All Tools
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(false)}
              sx={{ color: "red" }}
            >
              ✖
            </IconButton>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 36,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              "& .MuiTab-root": {
                minHeight: 36,
                textTransform: "none",
                fontSize: { xs: "0.7rem", md: "0.9rem" },
                fontWeight: 600,
                color: "#64748b",
                px: 1.5,
                "&.Mui-selected": { color: "#1976d2" }
              },
              "& .MuiTabs-indicator": {
                height: 2,
                background: "linear-gradient(90deg, #667eea, #764ba2)"
              }
            }}
          >
            <Tab label="📏 Distance" />
            <Tab label="🔷 Polygon" />
            <Tab label="🏗️ Infra" />
            <Tab label="⛰️ Elevation" />
          </Tabs>

          {/* Tab Content */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 1, md: 1.5 },
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" }
            }}
          >
            {activeTab === 0 && <DistanceMeasurementTab map={map} />}
            {activeTab === 1 && <PolygonDrawingTab map={map} />}
            {activeTab === 2 && <InfrastructureTab map={map} />}
            {activeTab === 3 && <ElevationTab map={map} />}
          </Box>

          {/* Resizer */}
          <Box
            onMouseDown={startResizing}
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              top: 0,
              right: 0,
              width: 6,
              height: "100%",
              cursor: "col-resize",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" }
            }}
          />
        </Box>
      </Collapse>

      {/* Map Container */}
      <Box sx={{ flex: 1, position: "relative" }}>
        {!sidebarOpen && (
          <Fab
            color="primary"
            size="medium"
            onClick={() => setSidebarOpen(true)}
            sx={{
              position: "absolute",
              top: 9,
              left: 190,
              zIndex: 25,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)"
            }}
          >
            <MenuIcon />
          </Fab>
        )}

        {/* Google Map as base layer */}
        <Box
          ref={mapRef}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        />

        {/* Search box overlay */}
        {loaded && map && (
          <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
            <MapSearchBox map={map} onPlaceSelect={handlePlaceSelect} />
          </Box>
        )}

        {/* Loading state */}
        {!loaded && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.9)",
              zIndex: 20
            }}
          >
            <Typography variant="h6" color="text.secondary">
              🗺️ Loading Google Maps...
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Typography
            color="error"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "white",
              p: 2,
              borderRadius: 1,
              zIndex: 30,
              boxShadow: 2
            }}
          >
            ❌ {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
