import { Box } from "@mui/material";
import { useState, useEffect } from "react";

export default function SidebarResizer({ onResize }) {
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 240) newWidth = 240;
      if (newWidth > 600) newWidth = 600;
      onResize(newWidth);
    };
    const stopResizing = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  return (
    <Box
      onMouseDown={startResizing}
      sx={{
        display: { xs: "none", md: "block" },
        position: "absolute",
        top: 0,
        right: 0,
        width: 6,
        height: "100%",
        cursor: "col-resize",
        "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" }
      }}
    />
  );
}
