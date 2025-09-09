import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  AdminPanelSettings,
  SupervisorAccount,
  Person,
} from "@mui/icons-material";

export default function RoleSummaryCards({ data = [] }) {
  const icons = {
    Admin: <AdminPanelSettings sx={{ fontSize: 28, mb: 1 }} />,
    Manager: <SupervisorAccount sx={{ fontSize: 28, mb: 1 }} />,
    "Normal User": <Person sx={{ fontSize: 28, mb: 1 }} />,
  };

  const colors = {
    Admin: "primary.main",
    Manager: "secondary.main",
    "Normal User": "success.main",
  };

  return (
    <Grid container spacing={2} mb={2}>
      {data.map((card) => (
        <Grid item xs={12} sm={4} key={card.role}>
          <Card
            sx={{
              bgcolor: colors[card.role],
              color: "white",
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {icons[card.role]}
              <Typography variant="body2">{card.role}</Typography>
              <Typography variant="h6" fontWeight="bold">
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
