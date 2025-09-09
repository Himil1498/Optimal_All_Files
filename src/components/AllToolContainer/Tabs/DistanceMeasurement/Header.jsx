import { Box, Typography } from "@mui/material";
import { Straighten as DistanceIcon } from "@mui/icons-material";

export default function Header({ measuring }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
            Distance Measurement
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontSize: "0.875rem" }}
          >
            Click on the map to measure distances between points
          </Typography>
        </Box>
      </Box>

      {measuring && (
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 2
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#667eea",
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.5, transform: "scale(1.2)" }
              }
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#667eea", fontWeight: 600 }}
          >
            Measurement mode active - Click on map to add points
          </Typography>
        </Box>
      )}
    </Box>
  );
}
