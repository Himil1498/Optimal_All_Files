import { Box, Button, Stack } from "@mui/material";

export default function Controls({
  measuring,
  setMeasuring,
  onSave,
  onView,
  onClear
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2}>
        {/* Start / Stop Measuring */}
        <Button
          variant={measuring ? "outlined" : "contained"}
          color="primary"
          onClick={() => setMeasuring(!measuring)}
        >
          {measuring ? "Stop Measuring" : "Start Measuring"}
        </Button>

        {/* Save Measurement */}
        <Button
          variant="contained"
          color="success"
          onClick={onSave}
          disabled={!measuring}
        >
          Save
        </Button>

        {/* View Saved */}
        <Button variant="outlined" color="info" onClick={onView}>
          View
        </Button>

        {/* Clear Current Polyline */}
        <Button variant="outlined" color="error" onClick={onClear}>
          Clear
        </Button>
      </Stack>
    </Box>
  );
}
