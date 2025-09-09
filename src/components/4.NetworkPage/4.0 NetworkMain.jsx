import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActionArea
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { useNavigate } from "react-router-dom";

export default function Network() {
  const navigate = useNavigate();

  const handleOpenTools = () => navigate("/network/allToolContainer");

  return (
    <Box sx={{ p: 3, position: "relative" }}>
      {/* Main Card */}
      <Card
        sx={{
          maxWidth: 600,
          margin: "0 auto",
          borderRadius: 3,
          boxShadow: 6,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 12,
            cursor: "pointer"
          },
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        }}
      >
        <CardActionArea onClick={() => navigate("/allToolCard")}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BuildIcon sx={{ mr: 1, fontSize: 28, color: "#1976d2" }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                Working : GIS Tool Interface
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              You can use these tools to measure distances, draw polygons, add
              infrastructure elements, and check elevation on the map.
            </Typography>
          </CardContent>
        </CardActionArea>

        <CardActionArea onClick={() => navigate("/gisToolInterface")}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BuildIcon sx={{ mr: 1, fontSize: 28, color: "#1976d2" }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                Testing : GIS Tool Interface
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              You can use these tools to measure distances, draw polygons, add
              infrastructure elements, and check elevation on the map.
            </Typography>
          </CardContent>
        </CardActionArea>

        <CardActionArea onClick={handleOpenTools}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BuildIcon sx={{ mr: 1, fontSize: 28, color: "#1976d2" }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                Testing : All Tool Container
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              You can use these tools to measure distances, draw polygons, add
              infrastructure elements, and check elevation on the map.
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
