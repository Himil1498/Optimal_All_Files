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

// Tab components
import DistanceMeasurementTab from "./Tabs/DistanceMeasurementTab";
import PolygonDrawingTab from "./Tabs/PolygonDrawingTab";
import InfrastructureTab from "./Tabs/InfrastructureTab";
import ElevationTab from "./Tabs/ElevationTab";

// Hooks
import useGoogleMapWithIndia from "../hooks/useGoogleMapWithIndia";
// import useRegionAccess from "../hooks/useRegionAccess"; // ✅ Uncomment when you have this hook

export default function AllTool({ userData = {} }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get("tab") || "0", 10);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState(null);

  const allowedRegions = userData.regions || [];

  // ✅ 1. Initialize Map
  const { mapRef, map, loaded } = useGoogleMapWithIndia({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  // ✅ 2. Region Access Control (Optional: Uncomment when ready)
  /*
  const { ready, fitMapToAllowedRegions } = useRegionAccess(
    map,
    userData.username || userData.id
  );

  // Auto-zoom once both are ready
  useEffect(() => {
    if (map && ready) {
      fitMapToAllowedRegions();
    }
  }, [map, ready, fitMapToAllowedRegions]);
  */

  // ✅ Handle tab change
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

  // ✅ Sidebar Resizing
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

  const handlePlaceSelect = (place) => {
    console.log("Selected place:", place);
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
      {/* ---------- Sidebar ---------- */}
      <Collapse in={sidebarOpen} orientation="horizontal" timeout={400}>
        <Box
          sx={{
            width: { xs: "100%", md: sidebarWidth },
            minWidth: { md: 240 },
            maxWidth: { md: 600 },
            height: { xs: "auto", md: "100%" },
            display: "flex",
            flexDirection: "column",
            borderRight: { md: "1px solid rgba(0,0,0,0.1)" },
            borderBottom: { xs: "1px solid rgba(0,0,0,0.1)", md: "none" },
            boxShadow: "4px 0 12px rgba(0,0,0,0.08)",
            backgroundColor: "white",
            position: "relative",
            zIndex: 10
          }}
        >
          {/* ---------- Sidebar Header ---------- */}
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

          {/* ---------- Tabs ---------- */}
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

          {/* ---------- Tab Content ---------- */}
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

          {/* ---------- Resizer ---------- */}
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

      {/* ---------- Map Container ---------- */}
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
              zIndex: 20,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)"
            }}
          >
            <MenuIcon />
          </Fab>
        )}

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

        {/* Loading Overlay */}
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
            <Typography variant="h6" color="text.secondary">
              🗺️ Loading Google Maps...
            </Typography>
          </Box>
        )}

        {/* Error Message */}
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
              zIndex: 10,
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
