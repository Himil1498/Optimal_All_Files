import {
  Stack,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

export default function UserCardList({
  users,
  handleOpenDialog,
  handleOpenPwdDialog,
  handleStatusClick,
  handleDeleteUser,
}) {
  if (!users || users.length === 0) {
    return <Typography textAlign="center">No users found</Typography>;
  }

  return (
    <Stack spacing={2}>
      {users.map((user) => (
        <Card
          key={user.username}
          sx={{
            boxShadow: 3,
            borderRadius: 2,
            p: 1,
          }}
        >
          <CardContent sx={{ pb: 1 }}>
            {/* User Basic Info */}
            <Typography variant="h6" fontWeight="bold">
              {user.fullName || user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {user.role || "Normal User"}
            </Typography>
            <Typography variant="body2">Email: {user.email || "-"}</Typography>
            <Typography variant="body2">Phone: {user.phone || "-"}</Typography>
            <Typography
              variant="body2"
              color={user.active ? "success.main" : "error.main"}
              fontWeight="bold"
            >
              Status: {user.active ? "Active" : "Inactive"}
            </Typography>
          </CardContent>

          <Divider sx={{ my: 1 }} />

          {/* Action Bar */}
          <Box
            display="flex"
            justifyContent="space-around"
            alignItems="center"
            sx={{ px: 1 }}
          >
            {/* Edit */}
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenDialog(user)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Activate / Deactivate */}
            <Tooltip title={user.active ? "Deactivate User" : "Activate User"}>
              <IconButton
                size="small"
                color={user.active ? "warning" : "success"}
                onClick={() =>
                  handleStatusClick(
                    user,
                    user.active ? "deactivate" : "activate"
                  )
                }
              >
                {user.active ? (
                  <ToggleOffIcon fontSize="small" />
                ) : (
                  <ToggleOnIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Delete User */}
            <Tooltip title="Delete User">
              <IconButton
                color="error"
                onClick={() => handleDeleteUser(user)} // opens dialog now
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}
