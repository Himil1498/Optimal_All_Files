import { Button } from "@mui/material";

export default function ClearMapButton({
  importedMarkers,
  setImportedMarkers
}) {
  const handleClear = () => {
    importedMarkers.forEach((m) => m.setMap(null));
    setImportedMarkers([]);
  };

  return (
    <Button variant="contained" color="error" onClick={handleClear}>
      Clear Map
    </Button>
  );
}
