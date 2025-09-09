import React from "react";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Tooltip,
  IconButton,
  Grid,
  Breadcrumbs,
  Link,
  useTheme,
  alpha
} from "@mui/material";
import {
  PanTool,
  CropFree,
  Timeline,
  Straighten,
  Business,
  Terrain,
  Place,
  Bookmark,
  BookmarkBorder,
  FilterAlt,
  Speed,
  Info
} from "@mui/icons-material";

const GISSidebar = ({
  sidebarOpen,
  darkMode,
  drawerWidth,
  layersVisible,
  bookmarks,
  drawingTools,
  baseMaps,
  activeTool,
  selectedBaseMap,
  handleToolChange,
  setSelectedBaseMap,
  setMapLoading,
  addNotification,
  handleBookmark,
  setMeasurementDialog,
  setElevationPanel
}) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: darkMode ? "grey.900" : "grey.50",
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        }
      }}
    >
      <Toolbar />

      {/* Breadcrumb Navigation */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: "0.8rem" }}>
          <Link underline="hover" color="inherit" href="#">
            Projects
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Current Project
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.8rem" }}>
            Map View
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ p: 2, overflow: "auto", height: "100%" }}>
        {/* Quick Stats */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">
                  {Object.values(layersVisible).filter(Boolean).length}
                </Typography>
                <Typography variant="caption">Active Layers</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">{bookmarks.length}</Typography>
                <Typography variant="caption">Bookmarks</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Enhanced Drawing Tools */}
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title="Drawing Tools"
            sx={{ pb: 1 }}
            titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
            action={
              <Tooltip title="Tool shortcuts available">
                <IconButton size="small">
                  <Info />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1
              }}
            >
              {drawingTools.map((tool) => (
                <Tooltip
                  key={tool.id}
                  title={`${tool.name} (${tool.shortcut})`}
                  placement="top"
                >
                  <Button
                    variant={
                      activeTool === tool.id ? "contained" : "outlined"
                    }
                    color={tool.color}
                    startIcon={<tool.icon />}
                    onClick={() => handleToolChange(tool.id)}
                    fullWidth
                    size="small"
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: 2
                      }
                    }}
                  >
                    {tool.name}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Enhanced Base Maps */}
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title="Base Maps"
            sx={{ pb: 1 }}
            titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
          />
          <CardContent sx={{ pt: 0 }}>
            <ToggleButtonGroup
              value={selectedBaseMap}
              exclusive
              onChange={(e, newMap) => {
                if (newMap) {
                  setSelectedBaseMap(newMap);
                  setMapLoading(true);
                  setTimeout(() => setMapLoading(false), 1000);
                  addNotification(`Switched to ${newMap} view`, "success");
                }
              }}
              aria-label="base map selection"
              orientation="vertical"
              fullWidth
              size="small"
            >
              {baseMaps.map((map) => (
                <ToggleButton
                  key={map.id}
                  value={map.id}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%"
                    }}
                  >
                    <Typography sx={{ mr: 1 }}>{map.icon}</Typography>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {map.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {map.desc}
                      </Typography>
                    </Box>
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        {/* Bookmarks Panel */}
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title="Bookmarks"
            sx={{ pb: 1 }}
            titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
            action={
              <Tooltip title="Add bookmark">
                <IconButton size="small" onClick={handleBookmark}>
                  <BookmarkBorder />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            {bookmarks.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                No bookmarks yet
              </Typography>
            ) : (
              <List dense>
                {bookmarks.slice(0, 3).map((bookmark) => (
                  <ListItemButton
                    key={bookmark.id}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <Bookmark color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={bookmark.name}
                      secondary={bookmark.timestamp}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Analysis Tools */}
        <Card>
          <CardHeader
            title="Analysis Tools"
            sx={{ pb: 1 }}
            titleTypographyProps={{ variant: "h6", fontSize: "1rem" }}
          />
          <CardContent sx={{ pt: 0 }}>
            <List dense>
              <ListItemButton
                onClick={() => setMeasurementDialog(true)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  <Straighten color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Measure Distance"
                  secondary="Calculate distances and areas"
                />
              </ListItemButton>
              <ListItemButton
                onClick={() => setElevationPanel(true)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  <Terrain color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Elevation Profile"
                  secondary="View terrain elevation"
                />
              </ListItemButton>
              <ListItemButton sx={{ borderRadius: 1, mb: 0.5 }}>
                <ListItemIcon>
                  <FilterAlt color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Spatial Analysis"
                  secondary="Advanced GIS analysis"
                />
              </ListItemButton>
              <ListItemButton sx={{ borderRadius: 1 }}>
                <ListItemIcon>
                  <Speed color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Performance Monitor"
                  secondary="Map rendering stats"
                />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>
      </Box>
    </Drawer>
  );
};

export default GISSidebar;
