import { Box, Tabs, Tab } from "@mui/material";

import DistanceMeasurementTab from "../Tabs/DistanceMeasurement/DistanceMeasurementTab";
import PolygonDrawingTab from "../Tabs/PolygonDrawing/PolygonDrawingTab"; // ✅ Fixed path
import InfrastructureTab from "../Tabs/InfraStructure/InfrastructureTab";
import ElevationTab from "../Tabs/ElevationTab";

export default function SidebarTabs({ activeTab, onTabChange, map }) {
  return (
    <>
      <Tabs
        value={activeTab}
        onChange={onTabChange}
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

      <Box
        sx={{
          flex: 1,
          p: { xs: 1, md: 1.5 },
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" }
        }}
      >
        {activeTab === 0 && <DistanceMeasurementTab map={map} />}
        {activeTab === 1 && <PolygonDrawingTab map={map} />}
        {activeTab === 2 && <InfrastructureTab map={map} />}
        {activeTab === 3 && <ElevationTab map={map} />}
      </Box>
    </>
  );
}
