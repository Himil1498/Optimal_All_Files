import React from "react";
import {
  Snackbar,
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Typography
} from "@mui/material";

const NotificationSystem = ({
  notifications,
  setNotifications,
  mapLoading
}) => {
  return (
    <>
      {/* Loading Backdrop */}
      <Backdrop open={mapLoading} sx={{ zIndex: 9999 }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="white">
            Processing...
          </Typography>
        </Box>
      </Backdrop>

      {/* Notification Snackbars */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={1000}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={notification.severity}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationSystem;
