import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  Chip,
  Stack,
  IconButton,
  Typography,
  Checkbox,
  TablePagination,
  Avatar,
  Toolbar,
  Tooltip,
  Button,
  Skeleton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import RestoreIcon from "@mui/icons-material/Restore";
import BlockIcon from "@mui/icons-material/Block";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { useState } from "react";

// ============================================
// UserTable Component
// Props:
// - users: array of user objects
// - loading: boolean, whether data is loading
// - handleOpenDialog: function to open edit dialog
// - handleOpenPwdDialog: function to open change-password dialog
// - handleStatusClick: function to change user status (activate/deactivate/delete)
// - setSnackbar: function to show notifications
// ============================================
export default function UserTable({
  users,
  loading,
  handleOpenDialog,
  // handleOpenPwdDialog,
  handleStatusClick,
  setSnackbar,
}) {
  // -----------------------
  // State variables
  // -----------------------
  const [orderBy, setOrderBy] = useState("username"); // column to sort
  const [order, setOrder] = useState("asc"); // sorting direction
  const [page, setPage] = useState(0); // current page in pagination
  const [rowsPerPage, setRowsPerPage] = useState(5); // rows per page
  const [selected, setSelected] = useState([]); // selected users (checkboxes)

  // -----------------------
  // Sort table by column
  // -----------------------
  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  // -----------------------
  // Sort users based on column & order
  // -----------------------
  const sortedUsers = [...users].sort((a, b) => {
    let valA = a[orderBy] || "";
    let valB = b[orderBy] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

  // -----------------------
  // Pagination: only show rows for current page
  // -----------------------
  const paginatedUsers = sortedUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // -----------------------
  // Checkbox handlers
  // -----------------------
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((u) => u.username)); // select all
    } else {
      setSelected([]); // deselect all
    }
  };

  const handleSelectOne = (username) => {
    setSelected(
      (prev) =>
        prev.includes(username)
          ? prev.filter((u) => u !== username) // deselect
          : [...prev, username] // select
    );
  };

  const isSelected = (username) => selected.includes(username);

  // -----------------------
  // Bulk actions
  // -----------------------
  const handleBulkDelete = () => {
    const selectedUsers = users.filter((u) => selected.includes(u.username));
    if (selectedUsers.length > 0) {
      handleStatusClick(selectedUsers, "delete");
    }
    setSelected([]); // clear selection
  };

  const handleBulkDeactivate = () => {
    const selectedUsers = users.filter(
      (u) => selected.includes(u.username) && u.active
    );
    if (selectedUsers.length > 0) {
      handleStatusClick(selectedUsers, "deactivate");
    }
    setSelected([]);
  };

  const handleBulkExport = () => {
    // CSV headers
    const header =
      "Username,Full Name,Role,Email,Phone,Regions,Status,Last Login\n";

    // CSV content from selected users
    const csv = users
      .filter((u) => selected.includes(u.username))
      .map(
        (u) =>
          `${u.username},${u.fullName || "-"},${
            u.admin ? "Admin" : u.role || "-"
          },${u.email || "-"},${u.phone || "-"},${
            u.regions?.join(" | ") || "-"
          },${u.active ? "Active" : "Inactive"},${u.lastLogin || "-"}`
      )
      .join("\n");

    // Download CSV
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "selected_users.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSnackbar({
      open: true,
      message: "Selected users exported!",
      severity: "success",
    });
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" mb={2} pl={2} pt={2}>
        User List
      </Typography>

      {/* Bulk Actions Toolbar (only visible if some users selected) */}
      {selected.length > 0 && (
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            bgcolor: "rgba(0,0,0,0.04)",
          }}
        >
          <Typography variant="body1">{selected.length} selected</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Deactivate Selected">
              <Button
                size="small"
                color="warning"
                variant="outlined"
                onClick={handleBulkDeactivate}
              >
                Deactivate
              </Button>
            </Tooltip>
            <Tooltip title="Delete Selected">
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </Tooltip>
            <Tooltip title="Export Selected">
              <Button
                size="small"
                color="primary"
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleBulkExport}
              >
                Export
              </Button>
            </Tooltip>
          </Stack>
        </Toolbar>
      )}

      {/* Table container with scroll */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {/* Checkbox for select all */}
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < users.length
                  }
                  checked={users.length > 0 && selected.length === users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>

              {/* Column headers */}
              {[
                { id: "username", label: "Username" },
                { id: "fullName", label: "Full Name" },
                { id: "role", label: "Role" },
                { id: "phone", label: "Phone" },
                { id: "email", label: "Email" },
                { id: "regions", label: "Regions" },
                { id: "active", label: "Status" },
                { id: "lastLogin", label: "Last Login" },
              ].map((col) => (
                <TableCell
                  key={col.id}
                  onClick={() => handleSort(col.id)}
                  sx={{
                    fontWeight: "900",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {col.label}
                  {orderBy === col.id ? (order === "asc" ? " 🔼" : " 🔽") : ""}
                </TableCell>
              ))}

              {/* Actions column */}
              <TableCell sx={{ fontWeight: "900" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Loading skeleton */}
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width={j === 0 ? 20 : 80} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedUsers.length > 0 ? (
              // Map through users
              paginatedUsers.map((user) => (
                <TableRow
                  key={user.username}
                  hover
                  selected={isSelected(user.username)}
                >
                  {/* Checkbox */}
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(user.username)}
                      onChange={() => handleSelectOne(user.username)}
                    />
                  </TableCell>

                  {/* Username + Avatar */}
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      gap={1}
                    >
                      <Avatar
                        src={user.avatarUrl}
                        sx={{ width: 28, height: 28 }}
                      >
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      {user.username}
                    </Stack>
                  </TableCell>

                  {/* Other columns */}
                  <TableCell>{user.fullName || "-"}</TableCell>
                  <TableCell>
                    {user.admin ? "Admin" : user.role || "-"}
                  </TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.regions?.join(", ") || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? "Active" : "Inactive"}
                      color={user.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.lastLogin || "-"}</TableCell>

                  {/* Action buttons */}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => handleOpenDialog(user)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          handleStatusClick(
                            user,
                            user.active ? "deactivate" : "activate"
                          )
                        }
                        color={user.active ? "warning" : "success"}
                        size="small"
                      >
                        {user.active ? <BlockIcon /> : <RestoreIcon />}
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusClick(user, "delete")}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // No users found
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Card>
  );
}
