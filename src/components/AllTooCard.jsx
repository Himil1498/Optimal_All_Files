import { Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AllToolCard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    // 🚀 Redirect immediately without rendering rest of component
    return <navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: "8vh",
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        // background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", // dark gradient
        color: "#f5f5f5", // light text
        p: 4,
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "auto"
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: 4,
          width: "100%",
          flexWrap: "wrap"
        }}
      >
        <Paper
          elevation={6}
          sx={{
            flex: 1,
            minWidth: 280,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#141e30,#243b55)",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-5px) scale(1.03)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.6)"
            }
          }}
          onClick={() => navigate("/allTools")}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🛠️ All-in-One Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            Access <b>Map Measurement</b>, <b>Drawing Polygon</b>,{" "}
            <b>Region Explorer</b>, <b>Elevation Viewer</b>, and{" "}
            <b>Add Infra</b> functionalities from a single interface. Perfect
            for admins and users who want quick access to all key tools in one
            place.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
