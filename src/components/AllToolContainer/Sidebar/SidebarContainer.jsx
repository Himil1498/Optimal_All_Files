import { useEffect, useState } from "react";
import { Box, Collapse } from "@mui/material";

import SidebarHeader from "./SidebarHeader";
import SidebarTabs from "./SidebarTabs";
import SidebarResizer from "./SidebarResizer";

export default function SidebarContainer({
  searchParams,
  setSearchParams,
  onClose,
  onBack,
  map
}) {
  const initialTab = parseInt(searchParams.get("tab") || "0", 10);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarWidth, setSidebarWidth] = useState(320);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue });
  };

  useEffect(() => {
    const tabFromUrl = parseInt(searchParams.get("tab") || "0", 10);
    if (tabFromUrl !== activeTab) setActiveTab(tabFromUrl);
  }, [searchParams]);

  return (
    <Collapse in orientation="horizontal" timeout={400}>
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
          zIndex: 10
        }}
      >
        <SidebarHeader onBack={onBack} onClose={onClose} />
        <SidebarTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          map={map}
        />
        <SidebarResizer onResize={setSidebarWidth} />
      </Box>
    </Collapse>
  );
}
