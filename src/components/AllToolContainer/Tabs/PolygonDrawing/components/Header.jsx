import { Box, Typography, Alert } from "@mui/material";
import {
  LocationOn as LocationIcon,
  Timeline as PolygonIcon
} from "@mui/icons-material";

export default function Header({ drawingPolygon }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
            color: "white"
          }}
        >
          <PolygonIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}
          >
            Polygon Drawing
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Draw and manage polygon shapes on the map
          </Typography>
        </Box>
      </Box>

      {drawingPolygon && (
        <Alert
          severity="info"
          icon={<LocationIcon />}
          sx={{
            borderRadius: "12px",
            backgroundColor: "rgba(255, 152, 0, 0.04)",
            border: "1px solid rgba(255, 152, 0, 0.2)"
          }}
        >
          Drawing mode active - Click on map to add vertices (minimum 3 points)
        </Alert>
      )}
    </Box>
  );
}
