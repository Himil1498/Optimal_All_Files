import UserTable from "./5.3.2 UserTable";
import UserCardList from "./5.3.1 UserCardList";
import TableSkeleton from "./TableSkeleton";
import CardSkeleton from "./CardSkeleton";

export default function UsersDisplay({
  users,
  isMobile,
  loading,
  handleOpenDialog,
  handleOpenPwdDialog,
  handleStatusClick,
  setSnackbar,
  handleDeleteUser,
}) {
  if (loading) {
    return isMobile ? <CardSkeleton count={5} /> : <TableSkeleton rows={5} />;
  }

  return isMobile ? (
    <UserCardList
      users={users}
      handleOpenDialog={handleOpenDialog}
      handleOpenPwdDialog={handleOpenPwdDialog}
      handleStatusClick={handleStatusClick}
      handleDeleteUser={handleDeleteUser} // ✅ Added
    />
  ) : (
    <UserTable
      users={users}
      handleOpenDialog={handleOpenDialog}
      handleOpenPwdDialog={handleOpenPwdDialog}
      handleStatusClick={handleStatusClick}
      setSnackbar={setSnackbar}
    />
  );
}
