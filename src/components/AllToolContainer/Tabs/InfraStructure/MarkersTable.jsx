import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Button,
  Box,
  Typography
} from "@mui/material";

export default function MarkersTable({ markersData, onView, highlightMarker }) {
  const [search, setSearch] = useState("");

  // Filter markers by search
  const filtered = markersData.filter((m) =>
    Object.values(m).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Function to get row background color
  const getRowColor = (marker) => {
    if (
      highlightMarker &&
      marker.position?.lat === highlightMarker.position?.lat &&
      marker.position?.lng === highlightMarker.position?.lng
    ) {
      return "rgba(255,255,0,0.3)";
    }
    switch (marker.type) {
      case "POP":
        return "rgba(173,216,230,0.3)"; // light blue
      case "Sub POP":
        return "rgba(144,238,144,0.3)"; // light green
      default:
        return "rgba(255,182,193,0.3)"; // light pink for imported
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      {/* Search Field */}
      <TextField
        fullWidth
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Type Legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <Typography sx={{ backgroundColor: "rgba(173,216,230,0.3)", p: 0.5 }}>
          POP
        </Typography>
        <Typography sx={{ backgroundColor: "rgba(144,238,144,0.3)", p: 0.5 }}>
          Sub POP
        </Typography>
        <Typography sx={{ backgroundColor: "rgba(255,182,193,0.3)", p: 0.5 }}>
          Imported
        </Typography>
        <Typography sx={{ backgroundColor: "rgba(255,255,0,0.3)", p: 0.5 }}>
          Highlighted
        </Typography>
      </Box>

      {/* Markers Table */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 400,
          overflowX: "auto", // allow horizontal scroll
          overflowY: "auto", // vertical scroll
          msOverflowStyle: "none", // IE & Edge
          "&::-webkit-scrollbar": {
            height: 0, // hide horizontal scrollbar
            width: 0 // hide vertical scrollbar
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Unique ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((m, idx) => (
              <TableRow key={idx} sx={{ backgroundColor: getRowColor(m) }}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{m.type || "Imported"}</TableCell>
                <TableCell>{m.name || "-"}</TableCell>
                <TableCell>{m.unique_id || "-"}</TableCell>
                <TableCell>{m.status || "-"}</TableCell>
                <TableCell>{m.address || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onView(m)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
