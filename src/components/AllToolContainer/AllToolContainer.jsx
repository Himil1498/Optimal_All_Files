import { Box, Fab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

import SidebarContainer from "./Sidebar/SidebarContainer";
import MapContainer from "./Map/MapContainer";
import useGoogleMapWithIndia from "../../hooks/useGoogleMapWithIndia";

export default function AllToolContainer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { mapRef, map, loaded, error } = useGoogleMapWithIndia({
    apiKey: "AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ",
    libraries: ["drawing", "geometry", "places"]
  });

  return (
    <Box sx={{ height: "90.8vh", width: "100vw", display: "flex" }}>
      {sidebarOpen && (
        <SidebarContainer
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          map={map}
          onBack={() => navigate("/network")}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <Box sx={{ flex: 1, position: "relative" }}>
        {!sidebarOpen && (
          <Fab
            color="primary"
            size="medium"
            onClick={() => setSidebarOpen(true)}
            sx={{ position: "absolute", top: 10, left: 20, zIndex: 20 }}
          >
            <MenuIcon />
          </Fab>
        )}

        <MapContainer map={map} mapRef={mapRef} loaded={loaded} error={error} />
      </Box>
    </Box>
  );
}
