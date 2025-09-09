import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";

export default function UserActivityTable({ users = [] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" mb={1}>
          Your Activity
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 240 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      {user.username}
                    </Stack>
                  </TableCell>
                  <TableCell>{user.fullName || "-"}</TableCell>
                  <TableCell>
                    {user.role || (user.admin ? "Admin" : "User")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? "Active" : "Inactive"}
                      color={user.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.lastLogin || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
