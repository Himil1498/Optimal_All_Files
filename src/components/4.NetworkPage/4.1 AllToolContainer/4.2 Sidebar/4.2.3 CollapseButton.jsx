import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export const CollapseButton = ({ open, onClick }) => (
  <Tooltip title={open ? "Collapse" : "Expand"}>
    <IconButton
      onClick={onClick}
      sx={{
        color: "#fff",
        p: 1,
        backgroundColor: "#3B82F6",
        "&:hover": {
          backgroundColor: "#2563EB",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        },
        width: open ? "100%" : 40,
        height: 40,
        borderRadius: open ? 2 : "50%",
        alignSelf: open ? "stretch" : "center",
        mt: 1,
        transition: "all 0.3s",
      }}
    >
      {open ? <ChevronLeft /> : <ChevronRight />}
    </IconButton>
  </Tooltip>
);
