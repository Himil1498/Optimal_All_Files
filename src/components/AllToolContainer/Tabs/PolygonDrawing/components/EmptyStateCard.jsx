import { Box, Typography } from "@mui/material";

export default function EmptyStateCard() {
  return (
    <Box
      sx={{
        textAlign: "center",
        p: 3,
        border: "1px dashed #ccc",
        borderRadius: 2,
        mt: 2
      }}
    >
      <Typography variant="h6" color="textSecondary">
        No saved polygons yet
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Start drawing a polygon and save it to see it listed here.
      </Typography>
    </Box>
  );
}
