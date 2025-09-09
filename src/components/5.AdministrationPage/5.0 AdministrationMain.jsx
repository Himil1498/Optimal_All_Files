import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";

import SummaryCards from "./5.1 SummaryCards";
import TopBar from "./5.2 TopBar/5.2.1 TopBar";
import UsersDisplay from "./5.3 UserDisplay/5.3 UsersDisplay";
import DialogsContainer from "./5.4 DialogContainer/5.4.1 DialogsContainer";

const isDevMode =
  import.meta.env.VITE_USE_MOCK === "true" ||
  import.meta.env.VITE_USE_MOCK === undefined;

export default function Administration() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openPwdDialog, setOpenPwdDialog] = useState(false);
  const [pwdUser, setPwdUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState([]);
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (isDevMode) {
        const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
        setUsers(storedUsers);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openConfirm = (userOrUsers, type) => {
    setConfirmUser(
      Array.isArray(userOrUsers) ? [...userOrUsers] : { ...userOrUsers }
    );
    setActionType(type);
  };

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filtered users with memoization
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (u.fullName || "")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? u.active
          : !u.active;
      const matchesRole =
        roleFilter === "all"
          ? true
          : (u.role || (u.admin ? "Admin" : "")).toLowerCase() === roleFilter;
      const matchesRegion =
        regionFilter.length === 0
          ? true
          : u.regions?.some((r) => regionFilter.includes(r));
      return matchesSearch && matchesStatus && matchesRole && matchesRegion;
    });
  }, [users, debouncedSearch, statusFilter, roleFilter, regionFilter]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmUser(user); // pass the user
    setActionType("delete"); // mark the action type
  };

  return (
    <Box
      p={{ xs: 2, sm: 3, md: 4 }}
      sx={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}
    >
      {/* Page Title */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Administration
        </Typography>
      </Box>
      {/* Summary Cards */}
      <SummaryCards users={users} loading={loading} />
      {/* Top Bar */}
      <TopBar
        users={users}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        handleOpenDialog={() => {
          setEditingUser(null);
          setOpenDialog(true);
        }}
      />
      {/* Users Display (Table or Cards based on screen size) */}
      <UsersDisplay
        users={filteredUsers}
        isMobile={isMobile}
        loading={loading}
        handleOpenDialog={handleEditUser}
        handleOpenPwdDialog={setPwdUser}
        handleStatusClick={openConfirm}
        setSnackbar={setSnackbar}
        handleDeleteUser={handleDeleteUser} // ✅ Important
      />

      {/* Dialogs */}
      <DialogsContainer
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        openPwdDialog={openPwdDialog}
        setOpenPwdDialog={setOpenPwdDialog}
        pwdUser={pwdUser}
        setPwdUser={setPwdUser}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmUser={confirmUser}
        actionType={actionType}
        setConfirmUser={setConfirmUser}
        setActionType={setActionType}
        users={users}
        setUsers={setUsers}
        fetchUsers={fetchUsers}
        setSnackbar={setSnackbar}
        isDevMode={isDevMode}
        activityLogOpen={activityLogOpen}
        setActivityLogOpen={setActivityLogOpen}
      />
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
