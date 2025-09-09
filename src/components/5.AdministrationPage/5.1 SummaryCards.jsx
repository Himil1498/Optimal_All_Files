import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function SummaryCards({ users }) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <Grid container spacing={2} mb={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ textAlign: "center" }}>
          <CardContent>
            <Typography variant="subtitle2">Total Users</Typography>
            <Typography variant="h6">{totalUsers}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ textAlign: "center", backgroundColor: "#e0f7fa" }}>
          <CardContent>
            <Typography variant="subtitle2">Active Users</Typography>
            <Typography variant="h6">{activeUsers}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ textAlign: "center", backgroundColor: "#ffebee" }}>
          <CardContent>
            <Typography variant="subtitle2">Inactive Users</Typography>
            <Typography variant="h6">{inactiveUsers}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
