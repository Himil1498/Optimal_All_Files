import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

export default function SaveDialog({
  open,
  onClose,
  handleSave,
  measurementPoints,
  totalDistance
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Save Measurement</DialogTitle>
      <DialogContent>
        <Typography>
          {measurementPoints.length} points, {totalDistance.toFixed(2)} km
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
