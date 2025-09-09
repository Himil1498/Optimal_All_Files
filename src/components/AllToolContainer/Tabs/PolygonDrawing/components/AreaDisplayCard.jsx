import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import {
  SquareFoot as AreaIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";
import { formatArea } from "./utils";

export default function AreaDisplayCard({ area, points }) {
  return (
    <Card sx={{ mb: 3, borderRadius: "16px" }}>
      <CardContent sx={{ p: 3, textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 1 }}>
          <AreaIcon sx={{ color: "#ff9800", fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {formatArea(area)}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
          Current Polygon Area
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Chip
            icon={<LocationIcon />}
            label={`${points.length} vertices`}
            size="small"
            sx={{ backgroundColor: "rgba(255, 152, 0, 0.1)", color: "#ff9800" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
