import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function ActivityLogDialog({ open, onClose, logs = [] }) {
  const [search, setSearch] = useState("");

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = safeLogs.filter(
    (log) =>
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>Activity Logs</DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Search Bar */}
        <div style={{ padding: "16px" }}>
          <TextField
            label="Search by User or Action"
            fullWidth
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredLogs.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 2, pb: 2 }}
          >
            No matching logs found.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 400, // 👈 fixed height
              overflowY: "auto", // 👈 scroll enabled
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 3,
              },
              scrollbarWidth: "thin",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>{log.ip || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
