import { Dialog } from "@mui/material";
import AddUser from "./5.4.2.AddUser/5.4.2.1 AddUser"; // Form for adding/editing user

// ------------------------
// Dialog Wrapper for Add/Edit User
// ------------------------
export default function UserDialog({ open, editingUser, onClose }) {
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
      <AddUser editingUser={editingUser} onClose={onClose} />
    </Dialog>
  );
}
