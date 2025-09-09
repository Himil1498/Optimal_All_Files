import { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import RoleSummaryCards from "./3.1 RoleSummaryCards";
import UserActivityTable from "./3.2 UserActivityTable";

export default function Dashboard() {
  const [allUsers, setAllUsers] = useState(
    JSON.parse(localStorage.getItem("allUsers")) || []
  );
  const [loggedInUser, setLoggedInUser] = useState(
    JSON.parse(localStorage.getItem("loggedInUser")) || null
  );

  const [roleData, setRoleData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const handleStorageChange = () => {
      setAllUsers(JSON.parse(localStorage.getItem("allUsers")) || []);
      setLoggedInUser(JSON.parse(localStorage.getItem("loggedInUser")) || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Role counts
    const adminCount = allUsers.filter((u) => u.role === "Admin").length;
    const managerCount = allUsers.filter((u) => u.role === "Manager").length;
    const normalCount = allUsers.filter((u) => u.role === "Normal User").length;

    setRoleData([
      { role: "Admin", value: adminCount },
      { role: "Manager", value: managerCount },
      { role: "Normal User", value: normalCount },
    ]);

    // Logged-in user activity
    if (loggedInUser) {
      const user = allUsers.find((u) => u.username === loggedInUser.username);
      setRecentUsers(user ? [user] : []);
    }
  }, [allUsers, loggedInUser]);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Dashboard
      </Typography>

      {/* Role Summary Cards */}
      <RoleSummaryCards data={roleData} />

      {/* Logged-in User Activity */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <UserActivityTable users={recentUsers} />
        </Grid>
      </Grid>
    </Box>
  );
}
