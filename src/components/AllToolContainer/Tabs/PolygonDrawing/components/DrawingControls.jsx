import { Box, Button, Stack, Tooltip } from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  ViewModule as ViewAllIcon
} from "@mui/icons-material";

export default function DrawingControls({
  drawingPolygon,
  startDrawing,
  stopDrawing,
  clearPolygon,
  polygonPoints,
  savedPolygons,
  addPolygon
}) {
  const handleSave = () => {
    if (polygonPoints.length < 3) return;
    addPolygon(
      polygonPoints.map((p) => ({ lat: p.lat, lng: p.lng })),
      window.google.maps.geometry.spherical.computeArea(
        new window.google.maps.Polygon({ paths: polygonPoints }).getPath()
      )
    );
    clearPolygon();
    stopDrawing();
  };

  return (
    <Stack spacing={2} sx={{ mb: 4 }}>
      <Button
        variant={drawingPolygon ? "outlined" : "contained"}
        onClick={drawingPolygon ? stopDrawing : startDrawing}
        startIcon={drawingPolygon ? <StopIcon /> : <StartIcon />}
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
              disabled={polygonPoints.length === 0}
            >
              Clear
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Save current polygon">
          <span>
            <Button
              variant="outlined"
              onClick={handleSave}
              startIcon={<SaveIcon />}
              disabled={polygonPoints.length < 3}
            >
              Save
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Button
        variant="outlined"
        startIcon={<ViewAllIcon />}
        disabled={savedPolygons.length === 0}
      >
        Show All Saved Polygons ({savedPolygons.length})
      </Button>
    </Stack>
  );
}
