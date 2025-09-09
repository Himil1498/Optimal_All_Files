import React from "react";
import {
  Box,
  LinearProgress,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Skeleton
} from "@mui/material";

const LoadingSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {[...Array(3)].map((_, i) => (
      <Card key={i} sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </Card>
    ))}
  </Box>
);

const LoadingScreen = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "grey.100" }}>
      <LinearProgress
        sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%"
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Loading GIS Professional...</Typography>
        <Typography variant="body2" color="text.secondary">
          Initializing map and region data
        </Typography>
      </Box>
    </Box>
  );
};

export { LoadingSkeleton };
export default LoadingScreen;
