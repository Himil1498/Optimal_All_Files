import { Button, Box } from "@mui/material";

export default function ClearMarkersButton({
  popLayer,
  subPopLayer,
  importMarkersRef
}) {
  const handleClearAllMarkers = () => {
    popLayer?.markers.forEach((m) => m?.setMap(null));
    subPopLayer?.markers.forEach((m) => m?.setMap(null));
    importMarkersRef?.current?.clearMarkers();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="outlined" color="error" onClick={handleClearAllMarkers}>
        Clear All Markers
      </Button>
    </Box>
  );
}
