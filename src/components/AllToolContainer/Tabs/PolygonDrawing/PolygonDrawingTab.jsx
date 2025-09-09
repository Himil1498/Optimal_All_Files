import { Box, Button } from "@mui/material";
import { useState, useEffect } from "react";

import usePolygonDrawing from "./hooks/usePolygonDrawing";
import useSavedPolygons from "./hooks/useSavedPolygons";
import SavePolygonDialog from "./components/SavePolygonDialog";
import SavedPolygonsTable from "./components/SavedPolygonsTable";
import SnackbarAlert from "./components/SnackbarAlert";
import useIndiaBoundary from "../../../../hooks/useIndiaBoundary"; // adjust path

export default function PolygonDrawingTab({ map }) {
  const {
    drawingPolygon,
    polygonPoints,
    polygonArea,
    startDrawing,
    stopDrawing,
    clearPolygon,
    handleMapClick,
    showSavedPolygon
  } = usePolygonDrawing(map);

  const {
    savedPolygons,
    addPolygon,
    deletePolygon
    // deleteIndex,
    // setDeleteIndex
  } = useSavedPolygons();

  const { isInsideIndia } = useIndiaBoundary(map);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const showSnackbar = (msg) => {
    setSnackbarMessage(msg);
    setSnackbarOpen(true);
  };

  // Map click listener that enforces India boundary before delegating to handleMapClick
  useEffect(() => {
    if (!map || !drawingPolygon) return;

    const listener = map.addListener("click", (event) => {
      const pt = { lat: event.latLng.lat(), lng: event.latLng.lng() };

      if (!isInsideIndia(pt)) {
        showSnackbar("Point must be inside India!");
        return;
      }

      // delegate
      handleMapClick(event);
    });

    return () => {
      // remove correctly
      try {
        listener.remove();
      } catch (e) {
        try {
          window.google.maps.event.removeListener(listener);
        } catch (err) {}
      }
    };
  }, [map, drawingPolygon, handleMapClick, isInsideIndia]);

  const handleSave = (name) => {
    if (polygonPoints.length < 3) {
      showSnackbar("Polygon must have at least 3 points!");
      return;
    }
    addPolygon(name, polygonPoints, polygonArea);
    clearPolygon();
    stopDrawing();
    showSnackbar("Polygon saved");
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <Button
          variant="contained"
          onClick={startDrawing}
          disabled={drawingPolygon}
        >
          Start Drawing
        </Button>

        <Button
          variant="outlined"
          onClick={stopDrawing}
          disabled={!drawingPolygon}
        >
          Stop Drawing
        </Button>

        <Button
          variant="outlined"
          onClick={clearPolygon}
          disabled={polygonPoints.length === 0}
        >
          Clear
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          disabled={polygonPoints.length < 3}
        >
          Save
        </Button>
      </Box>

      <SavedPolygonsTable
        savedPolygons={savedPolygons}
        onDeletePolygon={(index) => {
          // Remove from saved polygons
          deletePolygon(index);

          // Clear currently drawn polygon if it matches the deleted one
          const polygonToDelete = savedPolygons[index];
          if (
            polygonPoints.length === (polygonToDelete.points || []).length &&
            polygonPoints.every(
              (pt, i) =>
                pt.lat === polygonToDelete.points[i].lat &&
                pt.lng === polygonToDelete.points[i].lng
            )
          ) {
            clearPolygon();
          }

          showSnackbar("Polygon deleted");
        }}
        showSavedPolygon={showSavedPolygon}
      />

      <SavePolygonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(name) => {
          handleSave(name);
          setDialogOpen(false);
        }}
      />

      <SnackbarAlert
        open={snackbarOpen}
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
      />
    </Box>
  );
}
