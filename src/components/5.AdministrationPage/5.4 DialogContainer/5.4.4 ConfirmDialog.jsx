import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function ConfirmDialog({
  user, // can be single or array
  actionType,
  onClose,
  users,
  setUsers,
  fetchUsers,
  setSnackbar,
  isDevMode,
}) {
  if (!user) return null;

  const selectedUsers = Array.isArray(user) ? user : [user];
  const normalizedAction =
    actionType === "bulk-delete"
      ? "delete"
      : actionType === "bulk-deactivate"
      ? "deactivate"
      : actionType;

  const confirmAction = async () => {
    if (!selectedUsers.length || !normalizedAction) return;

    try {
      if (normalizedAction === "delete") {
        if (isDevMode) {
          const updatedUsers = users.filter(
            (u) => !selectedUsers.some((sel) => sel.username === u.username)
          );
          localStorage.setItem("users", JSON.stringify(updatedUsers));
          setUsers(updatedUsers);
        } else {
          await Promise.all(
            selectedUsers.map((sel) =>
              fetch(
                `${import.meta.env.VITE_API_BASE}/api/users/${sel.username}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              )
            )
          );
          await fetchUsers();
        }

        setSnackbar({
          open: true,
          message:
            selectedUsers.length === 1
              ? `${
                  selectedUsers[0].fullName || selectedUsers[0].username
                } deleted`
              : `${selectedUsers.length} users deleted`,
          severity: "error",
        });
      } else {
        const isActive = normalizedAction === "activate";
        if (isDevMode) {
          const updatedUsers = users.map((u) =>
            selectedUsers.some((sel) => sel.username === u.username)
              ? { ...u, active: isActive }
              : u
          );
          localStorage.setItem("users", JSON.stringify(updatedUsers));
          setUsers(updatedUsers);
        } else {
          await Promise.all(
            selectedUsers.map((sel) =>
              fetch(
                `${import.meta.env.VITE_API_BASE}/api/users/${
                  sel.username
                }/${normalizedAction}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({ active: isActive }),
                }
              )
            )
          );
          await fetchUsers();
        }

        setSnackbar({
          open: true,
          message:
            selectedUsers.length === 1
              ? `${selectedUsers[0].fullName || selectedUsers[0].username} ${
                  isActive ? "activated" : "deactivated"
                }`
              : `${selectedUsers.length} users ${
                  isActive ? "activated" : "deactivated"
                }`,
          severity: isActive ? "success" : "info",
        });
      }
    } catch (error) {
      console.error("Error in confirmAction:", error);
      setSnackbar({
        open: true,
        message: "Something went wrong",
        severity: "error",
      });
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={!!user} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {normalizedAction === "delete"
          ? "Delete Users"
          : normalizedAction === "activate"
          ? "Activate Users"
          : "Deactivate Users"}
      </DialogTitle>
      <DialogContent dividers>
        {selectedUsers.length > 1 ? (
          <>
            <Typography mb={1}>
              Are you sure you want to {normalizedAction} these{" "}
              <strong>{selectedUsers.length}</strong> users?
            </Typography>
            <List dense sx={{ maxHeight: 200, overflowY: "auto" }}>
              {selectedUsers.map((u) => (
                <ListItem key={u.username}>
                  <ListItemText primary={u.fullName || u.username} />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography>
            Are you sure you want to {normalizedAction}{" "}
            <strong>
              {selectedUsers[0].fullName || selectedUsers[0].username}
            </strong>
            ?
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color={
            normalizedAction === "delete"
              ? "error"
              : normalizedAction === "activate"
              ? "success"
              : "warning"
          }
          variant="contained"
          onClick={confirmAction}
        >
          {normalizedAction === "delete"
            ? "Delete"
            : normalizedAction === "activate"
            ? "Activate"
            : "Deactivate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
