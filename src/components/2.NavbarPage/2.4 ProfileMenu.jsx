import { useState, useEffect, useRef } from "react";
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function ProfileMenu({ user, loginTime, handleLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const intervalRef = useRef(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Calculate elapsed time
  const computeElapsed = () => {
    if (!loginTime) return;
    const start = new Date(loginTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const hrs = String(Math.floor(diff / 3600)).padStart(2, "0");
    const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const secs = String(diff % 60).padStart(2, "0");
    setElapsed(`${hrs}:${mins}:${secs}`);
  };

  useEffect(() => {
    if (!user) return;

    computeElapsed(); // initialize immediately
    intervalRef.current = setInterval(computeElapsed, 1000);

    const handleVisibilityChange = () => {
      clearInterval(intervalRef.current);
      if (!document.hidden)
        intervalRef.current = setInterval(computeElapsed, 1000);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, loginTime]);

  const formattedDate = loginTime
    ? new Date(loginTime).toLocaleDateString("en-GB")
    : "";

  return (
    <Box display="flex" alignItems="center" gap={2} ml="auto">
      <Box textAlign="right">
        <Typography variant="body2" fontWeight="bold">
          {user?.username || "User"}
        </Typography>
        <Typography variant="caption">
          Login since {formattedDate} {elapsed}
        </Typography>
      </Box>
      <Avatar
        sx={{ bgcolor: "white", color: "#0078D7", cursor: "pointer" }}
        onClick={handleMenuOpen}
      >
        {user?.username?.[0]?.toUpperCase() || "U"}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            handleLogout();
          }}
          sx={{
            color: "error.main",
            fontWeight: "bold",
            borderRadius: 1,
            "&:hover": { backgroundColor: "error.light", color: "white" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
