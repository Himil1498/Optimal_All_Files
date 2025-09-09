import {
  Dialog,
  Box,
  Typography,
  TextField,
  Stack,
  Button,
} from "@mui/material";

// ------------------------
// Password Reset Dialog
// ------------------------
export default function PasswordDialog({
  open,
  user,
  newPassword,
  setNewPassword,
  onClose,
  users,
  setUsers,
  fetchUsers,
  setSnackbar,
  isDevMode,
}) {
  const handleResetPassword = () => {
    if (!newPassword) return alert("Enter a password");

    if (isDevMode) {
      // Dev: Update localStorage
      const updatedUsers = users.map((u) =>
        u.username === user.username ? { ...u, password: newPassword } : u
      );
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setSnackbar({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });
    } else {
      // Prod: Call API
      fetch(
        `${import.meta.env.VITE_API_BASE}/api/users/${
          user.username
        }/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      ).then(() =>
        setSnackbar({
          open: true,
          message: "Password updated successfully",
          severity: "success",
        })
      );
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box p={3}>
        <Typography variant="h6" mb={2}>
          Reset Password for {user?.username}
        </Typography>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
