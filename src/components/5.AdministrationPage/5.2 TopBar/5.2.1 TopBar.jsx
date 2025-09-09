import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import SearchFilterBar from "./5.2.2 SearchFilterBar";

export default function TopBar({
  users,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  handleOpenDialog,
}) {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      mb={2}
      gap={1}
    >
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleOpenDialog={handleOpenDialog}
      />

      <Box display="flex" flexWrap="wrap" gap={1} mt={{ xs: 1, sm: 0 }}>
        <FormControl size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="normal user">User</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            const header =
              "Username,Full Name,Role,Email,Phone,Regions,Status,Last Login\n";
            const csv = users
              .map(
                (u) =>
                  `${u.username},${u.fullName || "-"},${
                    u.admin ? "Admin" : u.role || "-"
                  },${u.email || "-"},${u.phone || "-"},${
                    u.regions?.join(" | ") || "-"
                  },${u.active ? "Active" : "Inactive"},${u.lastLogin || "-"}`
              )
              .join("\n");
            const blob = new Blob([header + csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "users.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}
        >
          Export CSV
        </Button>
      </Box>
    </Box>
  );
}
