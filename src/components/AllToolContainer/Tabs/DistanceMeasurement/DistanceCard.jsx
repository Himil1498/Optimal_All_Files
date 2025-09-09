import { Card, CardContent, Typography, Chip } from "@mui/material";

export default function DistanceCard({ totalDistance, pointsCount }) {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
          Total Distance: {totalDistance.toFixed(2)} km
        </Typography>
        <Chip label={`${pointsCount} points`} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
