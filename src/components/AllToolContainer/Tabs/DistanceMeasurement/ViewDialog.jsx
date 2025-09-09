import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  DialogActions,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ViewDialog({
  open,
  onClose,
  measurements,
  onLoad,
  onDelete
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Saved Measurements</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Distance (km)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {measurements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No saved measurements
                </TableCell>
              </TableRow>
            ) : (
              measurements.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onLoad(m);
                      onClose();
                    }}
                  >
                    {m.name}
                  </TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell>
                    {m.segments.find((s) => s.index === "Total")?.distance}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => onDelete(m.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
