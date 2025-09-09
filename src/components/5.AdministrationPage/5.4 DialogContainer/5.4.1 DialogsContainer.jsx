import UserDialog from "./5.4.2 UserDialog";
import PasswordDialog from "./5.4.3 PasswordDialog";
import ConfirmDialog from "./5.4.4 ConfirmDialog";
import ActivityLogDialog from "./5.4.5 ActivityLogDialog";

export default function DialogsContainer({
  openDialog,
  setOpenDialog,
  editingUser,
  setEditingUser,
  openPwdDialog,
  setOpenPwdDialog,
  pwdUser,
  setPwdUser,
  newPassword,
  setNewPassword,
  confirmUser,
  actionType,
  setConfirmUser,
  setActionType,
  users,
  setUsers,
  fetchUsers,
  setSnackbar,
  isDevMode,
  activityLogOpen,
  setActivityLogOpen,
}) {
  return (
    <>
      <UserDialog
        open={openDialog}
        editingUser={editingUser}
        onClose={(refresh = false, message = "", severity = "success") => {
          setOpenDialog(false);
          setEditingUser(null);
          if (refresh) fetchUsers();
          if (message) setSnackbar({ open: true, message, severity });
        }}
      />

      <PasswordDialog
        open={openPwdDialog}
        user={pwdUser}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onClose={() => setOpenPwdDialog(false)}
        users={users}
        setUsers={setUsers}
        fetchUsers={fetchUsers}
        setSnackbar={setSnackbar}
        isDevMode={isDevMode}
      />

      <ConfirmDialog
        user={confirmUser}
        actionType={actionType}
        onClose={() => {
          setConfirmUser(null);
          setActionType(null);
        }}
        users={users}
        setUsers={setUsers}
        fetchUsers={fetchUsers}
        setSnackbar={setSnackbar}
        isDevMode={isDevMode}
      />

      <ActivityLogDialog
        open={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
      />
    </>
  );
}
