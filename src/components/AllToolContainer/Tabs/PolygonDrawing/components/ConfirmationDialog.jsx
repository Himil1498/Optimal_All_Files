import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { formatArea } from "./utils";

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  polygon
}) {
  if (!polygon) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WarningIcon sx={{ color: "#dc3545" }} />
          <Typography variant="h6">Confirm Deletion</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>You are about to delete this polygon:</Typography>
        <Typography sx={{ mt: 1 }}>
          • Area: {formatArea(polygon.area)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Delete Polygon
        </Button>
      </DialogActions>
    </Dialog>
  );
}
