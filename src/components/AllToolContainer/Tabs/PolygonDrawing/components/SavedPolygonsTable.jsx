import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";

export default function SavedPolygonsTable({
  savedPolygons,
  onDeletePolygon,
  showSavedPolygon
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleDeleteClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  const handleConfirmDelete = () => {
    if (selectedIndex !== null) {
      onDeletePolygon(selectedIndex); // call parent handler
    }
    handleClose();
  };

  if (!savedPolygons || savedPolygons.length === 0) {
    return <Box sx={{ color: "#64748b" }}>No polygons saved yet.</Box>;
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Vertices</TableCell>
            <TableCell>Area (m²)</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {savedPolygons.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{(p.points || []).length}</TableCell>
              <TableCell>{Number(p.area || 0).toFixed(0)}</TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => showSavedPolygon(p.points)}
                  title="View"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => handleDeleteClick(e, i)}
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem disabled>
          <Typography>Delete this polygon?</Typography>
        </MenuItem>
        <MenuItem onClick={handleConfirmDelete}>Yes</MenuItem>
        <MenuItem onClick={handleClose}>No</MenuItem>
      </Menu>
    </>
  );
}
