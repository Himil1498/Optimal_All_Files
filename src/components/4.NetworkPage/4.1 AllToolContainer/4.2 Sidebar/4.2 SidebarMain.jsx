import React, { useState } from "react";
import {
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import {
  ArrowBack,
  Straighten,
  Polyline,
  Business,
  ShowChart,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../../redux/authSlice";
import { SidebarMenuItem } from "./4.2.1 SidebarMenuItem";
import { UserProfile } from "./4.2.2 UserProfile";
import { CollapseButton } from "./4.2.3 CollapseButton";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { text: "Measure", icon: <Straighten sx={{ color: "#4FC3F7" }} /> },
    { text: "Polygon", icon: <Polyline sx={{ color: "#F06292" }} /> },
    { text: "Infrastructure", icon: <Business sx={{ color: "#81C784" }} /> },
    { text: "Elevation", icon: <ShowChart sx={{ color: "#FFD54F" }} /> },
  ];

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    handleCloseMenu();
    navigate("/");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 72,
          boxSizing: "border-box",
          height: "100vh",
          overflowX: "hidden",
          background: "linear-gradient(180deg, #1F2937 0%, #111827 100%)",
          color: "#fff",
          borderRight: "1px solid #2E3A59",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.3s",
        },
      }}
    >
      {/* Top Section */}
      <Box>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Back to Network">
            <IconButton
              size="small"
              onClick={() => navigate("/network")}
              sx={{ color: "#fff", p: 1, backgroundColor: "#3B82F6" }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          {open && (
            <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1 }}>
              Tools
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

        <List sx={{ pt: 1 }}>
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index} item={item} open={open} />
          ))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        <UserProfile
          open={open}
          user={user}
          onClick={handleProfileClick}
          anchorEl={anchorEl}
          handleCloseMenu={handleCloseMenu}
          handleLogout={handleLogout}
        />
        <CollapseButton open={open} onClick={() => setOpen(!open)} />
      </Box>
    </Drawer>
  );
}
