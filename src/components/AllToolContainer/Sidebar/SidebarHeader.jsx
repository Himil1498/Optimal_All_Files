import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SidebarHeader({ onBack, onClose }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1,
        py: 0.5,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        backgroundColor: "white"
      }}
    >
      <IconButton size="small" color="primary" onClick={onBack}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 1, flex: 1 }}>
        All Tools
      </Typography>
      <IconButton size="small" onClick={onClose} sx={{ color: "red" }}>
        ✖
      </IconButton>
    </Box>
  );
}
