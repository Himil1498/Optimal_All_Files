import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Fade,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState, useEffect } from "react";

export default function MobileDrawer({
  open,
  toggleDrawer,
  links,
  user,
  elapsed,
  formattedDate,
  handleLogout,
  location,
  navigate,
}) {
  const [fadeElapsed, setFadeElapsed] = useState(elapsed);

  // Animate timer with fade whenever `elapsed` changes
  useEffect(() => {
    setFadeElapsed(elapsed);
  }, [elapsed]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      PaperProps={{ sx: { backgroundColor: "#0078D7", color: "white" } }}
    >
      <Box
        sx={{ width: 250, p: 2 }}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <List>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <ListItemButton
                key={link.label}
                onClick={() => navigate(link.path)}
                sx={{
                  color: "white",
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            );
          })}

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {user?.username || "User"}
            </Typography>
            {/* Smooth fade animation for timer */}
            <Fade in={true} timeout={400} key={fadeElapsed}>
              <Typography variant="caption">
                Login since {formattedDate} {fadeElapsed}
              </Typography>
            </Fade>
          </Box>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              color: "error.main",
              "&:hover": { backgroundColor: "error.light", color: "white" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
