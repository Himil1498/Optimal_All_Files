import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer, // ✅ added this
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Chip,
  Badge,
  IconButton,
  Snackbar
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
  ViewModule as ViewAllIcon,
  Delete as DeleteIcon,
  Timeline as PolygonIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  SquareFoot as AreaIcon // ✅ better suited for area
} from "@mui/icons-material";
import useIndiaBoundary from "../../hooks/useIndiaBoundary";
import useRegionAccess from "../../hooks/useRegionAccess";

/**
 * PolygonDrawingTab Component
 *
 * A React component that provides an interface for drawing, managing, and saving polygons
 * on a Google Map. Users can draw polygons, save them, view saved polygons, and delete them.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.map - The Google Maps instance to draw on
 * @returns {JSX.Element} The rendered component
 */
// ==============================================
// Component State & Initialization
// ==============================================

export default function PolygonDrawingTab({ map }) {
  const { isInsideIndia } = useIndiaBoundary(map);
  const { ready, isInsideAllowedArea, fitMapToAllowedRegions } =
    useRegionAccess(map);

  // State variables for drawing and managing polygons
  const [drawingPolygon, setDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polygonMarkers, setPolygonMarkers] = useState([]);
  const [polygonShape, setPolygonShape] = useState(null);
  const [savedPolygons, setSavedPolygons] = useState(
    JSON.parse(localStorage.getItem("savedPolygons")) || []
  );
  const [polygonArea, setPolygonArea] = useState(0);

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [displayedPolygons, setDisplayedPolygons] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /**
   * Handles map click events when in drawing mode
   * Adds markers and draws the polygon as the user clicks on the map
   */
  useEffect(() => {
    if (!map || !drawingPolygon) return;

    const clickListener = map.addListener("click", (event) => {
      const newPoint = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      // ✅ Check if the point is inside India
      if (!isInsideIndia(newPoint)) {
        setSnackbarMessage("Cannot add point outside India!");
        setSnackbarOpen(true);
        return;
      }
      // ✅ Check region access
      if (ready && !isInsideAllowedArea(newPoint)) {
        setSnackbarMessage("You don't have access to this region.");
        setSnackbarOpen(true);
        return;
      }

      const marker = new window.google.maps.Marker({
        position: newPoint,
        map: map,
        title: `Vertex ${polygonPoints.length + 1}`
      });

      const updatedPoints = [...polygonPoints, newPoint];
      const updatedMarkers = [...polygonMarkers, marker];

      setPolygonPoints(updatedPoints);
      setPolygonMarkers(updatedMarkers);

      // Draw polygon shape
      if (polygonShape) polygonShape.setMap(null);

      if (updatedPoints.length > 2) {
        const polygon = new window.google.maps.Polygon({
          paths: updatedPoints,
          strokeColor: "#FF9800",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF9800",
          fillOpacity: 0.35,
          map: map
        });
        setPolygonShape(polygon);

        // Calculate area while drawing
        const area = window.google.maps.geometry.spherical.computeArea(
          polygon.getPath()
        );
        setPolygonArea(area);
      }
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [
    map,
    drawingPolygon,
    polygonPoints,
    polygonMarkers,
    polygonShape,
    isInsideIndia,
    isInsideAllowedArea,
    ready
  ]);

  useEffect(() => {
    if (!map) return;
    fitMapToAllowedRegions();
  }, [map, fitMapToAllowedRegions]);

  /**
   * Clears the currently drawn polygon and any displayed polygons from the map
   * Resets the drawing state
   */
  const clearPolygon = () => {
    // Remove markers
    polygonMarkers.forEach((m) => m.setMap(null));
    setPolygonMarkers([]);

    // Remove single polygon
    if (polygonShape) {
      polygonShape.setMap(null);
      setPolygonShape(null);
    }

    // Remove polygons shown via "Show All"
    displayedPolygons.forEach((p) => p.setMap(null));
    setDisplayedPolygons([]);

    // Reset points & area
    setPolygonPoints([]);
    setPolygonArea(0);
  };

  /**
   * Displays a single saved polygon on the map
   * @param {Object} poly - The polygon object containing points and area
   */
  const handleShowPolygon = (poly) => {
    clearPolygon();
    if (!map) return;

    const polygon = new window.google.maps.Polygon({
      paths: poly.points,
      strokeColor: "#FF9800",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF9800",
      fillOpacity: 0.35,
      map: map
    });

    setPolygonShape(polygon);
    setPolygonArea(poly.area);
  };

  /**
   * Displays all saved polygons on the map
   */
  const handleShowAllPolygons = () => {
    // clear previous displayed polygons
    displayedPolygons.forEach((p) => p.setMap(null));

    const polys = savedPolygons.map((poly) => {
      const polygon = new window.google.maps.Polygon({
        paths: poly.points,
        strokeColor: "#4CAF50",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#4CAF50",
        fillOpacity: 0.35,
        map: map
      });
      return polygon;
    });

    setDisplayedPolygons(polys);
  };

  /**
   * Handles the delete button click by showing the confirmation dialog
   * @param {number} index - Index of the polygon to delete
   */
  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
    setOpenDialog(true);
  };

  /**
   * Confirms and executes the deletion of a saved polygon
   * Removes the polygon from storage and updates the UI
   */
  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      const polyToDelete = savedPolygons[deleteIndex];

      const filtered = savedPolygons.filter((_, i) => i !== deleteIndex);
      localStorage.setItem("savedPolygons", JSON.stringify(filtered));
      setSavedPolygons(filtered);

      // Remove from map if it's currently displayed
      if (polygonShape) {
        const currentPoints = polygonShape
          .getPath()
          .getArray()
          .map((p) => ({
            lat: p.lat(),
            lng: p.lng()
          }));

        const samePolygon =
          JSON.stringify(currentPoints) === JSON.stringify(polyToDelete.points);

        if (samePolygon) {
          polygonShape.setMap(null);
          setPolygonShape(null);
          setPolygonArea(0);
        }
      }

      // Also clear if shown in "Show All"
      displayedPolygons.forEach((p) => p.setMap(null));
      setDisplayedPolygons([]);
    }
    setDeleteIndex(null);
    setOpenDialog(false);
  };

  /**
   * Cancels the delete operation and closes the confirmation dialog
   */
  const handleCancelDelete = () => {
    setDeleteIndex(null);
    setOpenDialog(false);
  };

  /**
   * Formats the area value into a human-readable string
   * @param {number} area - Area in square meters
   * @returns {string} Formatted area string with appropriate units
   */
  const formatArea = (area) => {
    if (area >= 1e6) {
      return `${(area / 1e6).toFixed(3)} km²`;
    } else if (area >= 1e4) {
      return `${(area / 1e4).toFixed(2)} hectares`;
    } else {
      return `${area.toFixed(2)} m²`;
    }
  };

  return (
    <Box>
      {/* Modern Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <PolygonIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}
            >
              Polygon Drawing
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.875rem" }}
            >
              Draw and manage polygon shapes on the map
            </Typography>
          </Box>
        </Box>

        {drawingPolygon && (
          <Alert
            severity="info"
            icon={<LocationIcon />}
            sx={{
              borderRadius: "12px",
              backgroundColor: "rgba(255, 152, 0, 0.04)",
              border: "1px solid rgba(255, 152, 0, 0.2)",
              "& .MuiAlert-icon": { color: "#ff9800" },
              "& .MuiAlert-message": {
                color: "#ff9800",
                fontWeight: 600,
                fontSize: "0.875rem"
              }
            }}
          >
            Drawing mode active - Click on map to add vertices (minimum 3
            points)
          </Alert>
        )}
      </Box>

      {/* Control Buttons */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Button
          variant={drawingPolygon ? "outlined" : "contained"}
          onClick={() => {
            if (drawingPolygon) setDrawingPolygon(false);
            else {
              setDrawingPolygon(true);
              clearPolygon();
            }
          }}
          startIcon={drawingPolygon ? <StopIcon /> : <StartIcon />}
          sx={{
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            ...(drawingPolygon
              ? {
                  color: "#dc3545",
                  borderColor: "#dc3545",
                  "&:hover": {
                    backgroundColor: "rgba(220, 53, 69, 0.04)",
                    borderColor: "#dc3545"
                  }
                }
              : {
                  background:
                    "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  boxShadow: "0 4px 16px rgba(255, 152, 0, 0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(255, 152, 0, 0.4)",
                    transform: "translateY(-1px)"
                  }
                })
          }}
        >
          {drawingPolygon ? "Stop Drawing" : "Start Drawing Polygon"}
        </Button>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Tooltip title="Clear current polygon">
            <span>
              <Button
                variant="outlined"
                onClick={clearPolygon}
                startIcon={<ClearIcon />}
                disabled={
                  polygonPoints.length === 0 &&
                  !polygonShape &&
                  displayedPolygons.length === 0
                }
                sx={{
                  width: "100%",
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#dc3545",
                    color: "#dc3545",
                    backgroundColor: "rgba(220, 53, 69, 0.04)"
                  },
                  "&:disabled": {
                    opacity: 0.5,
                    borderColor: "rgba(0,0,0,0.08)",
                    color: "rgba(0,0,0,0.3)"
                  }
                }}
              >
                Clear
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Save current polygon">
            <span>
              <Button
                variant="outlined"
                onClick={() => {
                  if (polygonPoints.length < 3) return;

                  const polygonPath = new window.google.maps.Polygon({
                    paths: polygonPoints
                  });
                  const area =
                    window.google.maps.geometry.spherical.computeArea(
                      polygonPath.getPath()
                    );

                  const updated = [
                    ...savedPolygons,
                    {
                      points: polygonPoints.map((p) => ({
                        lat: p.lat,
                        lng: p.lng
                      })), // ensure plain objects
                      area
                    }
                  ];
                  localStorage.setItem(
                    "savedPolygons",
                    JSON.stringify(updated)
                  );
                  setSavedPolygons(updated);

                  clearPolygon();
                  setDrawingPolygon(false);
                }}
                disabled={polygonPoints.length < 3}
                startIcon={<SaveIcon />}
                sx={{
                  width: "100%",
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#28a745",
                    color: "#28a745",
                    backgroundColor: "rgba(40, 167, 69, 0.04)"
                  },
                  "&:disabled": {
                    opacity: 0.5
                  }
                }}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Button
          variant="outlined"
          onClick={handleShowAllPolygons}
          startIcon={<ViewAllIcon />}
          disabled={savedPolygons.length === 0}
          sx={{
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            borderColor: "rgba(0, 0, 0, 0.12)",
            color: "#64748b",
            "&:hover": {
              borderColor: "#4CAF50",
              color: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.04)"
            },
            "&:disabled": {
              opacity: 0.5
            }
          }}
        >
          Show All Saved Polygons ({savedPolygons.length})
        </Button>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // 3 seconds
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Area Display Card */}
      {polygonArea > 0 && (
        <Card
          sx={{
            mb: 3,
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(245, 124, 0, 0.05))",
            border: "1px solid rgba(255, 152, 0, 0.1)",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)"
          }}
        >
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 1
              }}
            >
              <AreaIcon sx={{ color: "#ff9800", fontSize: 28 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#1a1a1a" }}
              >
                {formatArea(polygonArea)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Current Polygon Area
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <Chip
                icon={<LocationIcon sx={{ fontSize: 16 }} />}
                label={`${polygonPoints.length} vertices`}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  color: "#ff9800",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: "#ff9800" }
                }}
              />
              <Chip
                label={`${(polygonArea / 1e6).toFixed(3)} km²`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "#ff9800",
                  color: "#ff9800",
                  fontWeight: 600
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator for Drawing */}
      {drawingPolygon && polygonPoints.length > 0 && (
        <Card
          sx={{
            mb: 3,
            borderRadius: "12px",
            border: "1px solid rgba(255, 152, 0, 0.2)",
            backgroundColor: "rgba(255, 152, 0, 0.02)"
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#ff9800",
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.5, transform: "scale(1.2)" }
                  }
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "#ff9800", fontWeight: 600 }}
              >
                Drawing in progress: {polygonPoints.length} points added
                {polygonPoints.length < 3 &&
                  ` (need ${3 - polygonPoints.length} more to complete)`}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Saved Polygons Table */}
      {savedPolygons.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: "16px", overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 2
            }}
          >
            <PolygonIcon sx={{ color: "#ff9800", fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "1rem" }}
            >
              Saved Polygons ({savedPolygons.length})
            </Typography>
          </Box>
          <TableContainer
            sx={{
              maxHeight: 400, // or whatever height you want
              overflowY: "scroll", // keep scrolling
              scrollbarWidth: "none", // Firefox
              "&::-webkit-scrollbar": {
                display: "none" // Chrome, Safari, Edge
              }
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Coordinates
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Area
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedPolygons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <PolygonIcon
                          sx={{ fontSize: 48, color: "#e0e7ff", mb: 2 }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ color: "#64748b", mb: 1 }}
                        >
                          No polygons saved yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          Start drawing to create your first polygon
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  savedPolygons.map((poly, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(248, 250, 252, 0.5)"
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255, 152, 0, 0.04)"
                        }
                      }}
                    >
                      <TableCell>
                        <Badge
                          badgeContent={poly.points?.length || 0}
                          color="primary"
                          sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem" } }}
                        >
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              backgroundColor: "#ff9800",
                              color: "white",
                              fontWeight: 600
                            }}
                          />
                        </Badge>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            whiteSpace: "normal", // allow wrapping
                            wordBreak: "break-word", // break long text
                            color: "#64748b"
                          }}
                        >
                          {poly.points
                            .map(
                              (p) =>
                                `(${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`
                            )
                            .join(", ")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1a1a1a" }}
                          >
                            {formatArea(poly.area)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            {poly.area.toFixed(0)} m²
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Show polygon on map">
                            <IconButton
                              size="small"
                              onClick={() => handleShowPolygon(poly)}
                              sx={{
                                color: "#4CAF50",
                                "&:hover": {
                                  backgroundColor: "rgba(76, 175, 80, 0.04)"
                                }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete polygon">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(index)}
                              sx={{
                                color: "#dc3545",
                                "&:hover": {
                                  backgroundColor: "rgba(220, 53, 69, 0.04)"
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {savedPolygons.length === 0 && (
        <Card
          sx={{
            borderRadius: "16px",
            border: "2px dashed rgba(255, 152, 0, 0.2)",
            backgroundColor: "rgba(255, 152, 0, 0.02)"
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <PolygonIcon
              sx={{ fontSize: 64, color: "rgba(255, 152, 0, 0.3)", mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1a1a1a", mb: 1 }}
            >
              No Polygons Created Yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", mb: 3, maxWidth: 300, mx: "auto" }}
            >
              Start drawing your first polygon by clicking the "Start Drawing
              Polygon" button above, then click on the map to add vertices.
            </Typography>
            <Chip
              icon={<CheckIcon />}
              label="Minimum 3 points required"
              size="small"
              color="info"
              variant="outlined"
            />
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: { borderRadius: "16px", minWidth: 360 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WarningIcon sx={{ color: "#dc3545" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirm Deletion
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(220, 53, 69, 0.04)",
              border: "1px solid rgba(220, 53, 69, 0.1)",
              mb: 2
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              You are about to delete:
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
              • Polygon #{deleteIndex !== null ? deleteIndex + 1 : ""}
            </Typography>
            {deleteIndex !== null && savedPolygons[deleteIndex] && (
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                • Area: {formatArea(savedPolygons[deleteIndex].area)}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            This action cannot be undone. The polygon will be permanently
            removed from your saved collection.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #dc3545, #c82333)",
              "&:hover": {
                background: "linear-gradient(135deg, #c82333, #a71e2a)"
              }
            }}
          >
            Delete Polygon
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
