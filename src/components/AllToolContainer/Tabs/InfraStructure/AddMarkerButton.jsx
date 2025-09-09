import { Button } from "@mui/material";

export default function AddMarkerButton({ label, onClick }) {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      sx={{ mt: 2 }}
    >
      {label}
    </Button>
  );
}
