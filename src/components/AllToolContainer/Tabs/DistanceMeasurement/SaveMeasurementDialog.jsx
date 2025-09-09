import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";
import { useState } from "react";

export default function SaveMeasurementDialog({ open, onClose, onSave }) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name.trim()) return; // require a name
    onSave(name); // pass name to parent
    setName(""); // reset input
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Save Measurement</DialogTitle>
      <DialogContent>
        <TextField
          label="Measurement Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
