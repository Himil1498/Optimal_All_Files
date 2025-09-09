import React from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  ListItemButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// ---------------- Menu Item Component ----------------
export const SidebarMenuItem = ({ open, item }) => {
  return (
    <Tooltip title={!open ? item.text : ""} placement="right" arrow>
      <ListItem disablePadding>
        <ListItemButton
          sx={{
            justifyContent: open ? "flex-start" : "center",
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.08)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s",
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: item.icon.props.sx.color }}>
            {item.icon}
          </ListItemIcon>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ overflow: "hidden" }}
              >
                <ListItemText
                  primary={item.text}
                  sx={{ ml: 1, whiteSpace: "nowrap" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};
