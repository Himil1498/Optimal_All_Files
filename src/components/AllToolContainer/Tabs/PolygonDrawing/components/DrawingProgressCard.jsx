import { Card, CardContent, Typography, Box } from "@mui/material";

export default function DrawingProgressCard({ points }) {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: "12px",
        border: "1px solid rgba(255, 152, 0, 0.2)"
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ff9800",
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.5, transform: "scale(1.2)" }
              }
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#ff9800", fontWeight: 600 }}
          >
            Drawing in progress: {points.length} points added
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
