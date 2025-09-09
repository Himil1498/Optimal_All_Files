import { Box, Typography, Chip } from "@mui/material";

export default function Logo({ isDevMode }) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="h6" fontWeight="bold">
        GIS Dashboard
      </Typography>
      {isDevMode && (
        <Chip
          label="DEV MODE"
          color="warning"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      )}
    </Box>
  );
}
