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
        {/* Box 1 - Map Section */}
        <Paper
          elevation={6}
          sx={{
            flex: 1,
            minWidth: 280,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#1f1c2c,#928dab)",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-5px) scale(1.03)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.6)"
            }
          }}
          onClick={() => navigate("/mapMeasurement")}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🗺️ Map & Measurement
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            Click here to open the interactive map where you can{" "}
            <b>measure distances</b>, <b>draw polygons</b>, and visualize
            geographical areas.
          </Typography>
        </Paper>

        {/* Box 2 - Drawing Polygon Section */}
        <Paper
          elevation={6}
          sx={{
            flex: 1,
            minWidth: 280,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#42275a,#734b6d)",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-5px) scale(1.03)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.6)"
            }
          }}
          onClick={() => navigate("/polygonDrawing")}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🔷 Drawing Polygon
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            Create and manage <b>custom polygons</b> directly on the map. Define
            regions by placing vertices, calculate <b>area</b>, and{" "}
            <b>save polygons</b> for future reference.
          </Typography>
        </Paper>

        {/* Box 3 - Add Infra Section */}
        <Paper
          elevation={6}
          sx={{
            flex: 1,
            minWidth: 280,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#0f2027,#2c5364)",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-5px) scale(1.03)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.6)"
            }
          }}
          onClick={() => navigate("/addInfra")}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🏗️ Add Infra Details
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            Click here to add new <b>infrastructure details</b> to the system.
            You can input <b>name</b>, <b>location</b>, <b>type</b>, and{" "}
            <b>assign categories</b>. Manage infrastructure efficiently and
            securely.
          </Typography>
        </Paper>

        {/* Box 4 - Region Explorer Section */}
        {/* <Paper
          elevation={6}
          sx={{
            flex: 1,
            minWidth: 280,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#232526,#414345)",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-5px) scale(1.03)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.6)"
            }
          }}
          onClick={() => navigate("/regionalExplorer")}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🌍 Region Explorer
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            Click here to explore different <b>geographical boundaries</b>:
          </Typography>
          <ul style={{ marginTop: "8px", color: "#bbb" }}>
            <li>🟢 All India’s state boundaries</li>
            <li>🔵 A single state’s boundary</li>
            <li>🟠 Different district boundaries</li>
            <li>⚫ Custom regional views</li>
          </ul>
        </Paper> */}

        {/* Box 5 - Elevation Section */}
        <Paper
          elevation={6}
          sx={{
            flex: 1,
            minWidth: 280,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#3a6186,#89253e)",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-5px) scale(1.03)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.6)"
            }
          }}
          onClick={() => navigate("/elevation")}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⛰️ Elevation Viewer
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            Explore the terrain and elevation data for any region. Visualize{" "}
            <b>height variations</b>, <b>generate elevation profiles</b>, and
            understand the topography interactively.
          </Typography>
        </Paper>

        {/* Box 6 - All-in-One Dashboard */}
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
