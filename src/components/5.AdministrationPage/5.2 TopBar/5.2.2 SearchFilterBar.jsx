import {
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// ------------------------
// Search + Filter + Add User Bar
// ------------------------
export default function SearchFilterBar({
  searchQuery, // Current search input
  setSearchQuery, // Function to update search input
  statusFilter, // Current status filter ('all', 'active', 'inactive')
  setStatusFilter, // Function to update status filter
  handleOpenDialog, // Function to open Add User dialog
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", sm: "center" }}
      mb={2}
    >
      {/* Add User Button */}
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Add User
      </Button>

      {/* Search Field */}
      <TextField
        placeholder="Search by username, name, or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
        }}
        sx={{ flex: 1 }}
      />

      {/* Status Dropdown Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
