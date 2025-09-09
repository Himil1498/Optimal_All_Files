import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";
import { useState, useEffect } from "react";

export default function SavePolygonDialog({ open, onClose, onSave }) {
  const [polygonName, setPolygonName] = useState("");

  useEffect(() => {
    if (!open) setPolygonName("");
  }, [open]);

  const handleSave = () => {
    if (!polygonName.trim()) return;
    onSave(polygonName.trim());
    setPolygonName("");
  };

  const handleClose = () => {
    setPolygonName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Name Your Polygon</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Polygon Name"
          fullWidth
          variant="outlined"
          value={polygonName}
          onChange={(e) => setPolygonName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
