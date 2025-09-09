import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Slider,
  Chip,
  TextField,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  Divider
} from "@mui/material";

import {
  Straighten,
  Terrain,
  Business,
  Settings,
  ExpandMore,
  Refresh,
  Save,
  Download,
  GpsFixed,
  Analytics,
  Place,
  Room,
  Timeline,
  Search,
  Clear,
  Visibility,
  VisibilityOff,
  Navigation,
  ContentCopy
} from "@mui/icons-material";

const GISDialogs = ({
  measurementDialog,
  setMeasurementDialog,
  elevationPanel,
  setElevationPanel,
  infrastructureDialog,
  setInfrastructureDialog,
  selectedInfraType,
  setSelectedInfraType,
  infrastructureTypes,
  settingsDialog,
  setSettingsDialog,
  darkMode,
  setDarkMode,
  showMiniMap,
  setShowMiniMap,
  currentCoords,
  setCurrentCoords,
  addNotification,
  // WOK-specific props
  wokAnalysisDialog = false,
  setWokAnalysisDialog = () => {},
  spatialAnalysisDialog = false,
  setSpatialAnalysisDialog = () => {},
  coordinateSearchDialog = false,
  setCoordinateSearchDialog = () => {},
  wokCoordinates = { lat: 0, lng: 0, zoom: 12 },
  dynamicDistance = 1,
  distanceUnit = "km"
}) => {
  const [wokResults, setWokResults] = useState({
    analysis: [],
    measurements: [],
    searchResults: []
  });

  return (
    <>
      {/* Measurement Dialog */}
      <Dialog
        open={measurementDialog}
        onClose={() => setMeasurementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Straighten color="primary" />
            Measurement Tool
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" paragraph>
              Click on the map to start measuring distances and areas.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="h6" color="primary">
                Results
              </Typography>
              <Typography variant="body2">Distance: 0 km</Typography>
              <Typography variant="body2">Area: 0 km²</Typography>
            </Paper>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} sx={{ mr: 1 }}>
                Reset
              </Button>
              <Button variant="contained" startIcon={<Save />}>
                Save Measurement
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeasurementDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Elevation Panel Dialog */}
      <Dialog
        open={elevationPanel}
        onClose={() => setElevationPanel(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Terrain color="success" />
            Elevation Profile
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Paper
              sx={{
                p: 2,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.50"
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Elevation chart will be displayed here
              </Typography>
            </Paper>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Chip label="Max: 1,234m" color="success" />
              <Chip label="Min: 45m" color="info" />
              <Chip label="Avg: 567m" color="primary" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Download />}>Export</Button>
          <Button onClick={() => setElevationPanel(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Infrastructure Dialog */}
      <Dialog
        open={infrastructureDialog}
        onClose={() => setInfrastructureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Business color="error" />
            Infrastructure Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Infrastructure Type</InputLabel>
              <Select
                value={selectedInfraType}
                onChange={(e) => setSelectedInfraType(e.target.value)}
                label="Infrastructure Type"
              >
                {infrastructureTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedInfraType && (
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="h6" gutterBottom>
                  {selectedInfraType} Analysis
                </Typography>
                <Typography variant="body2" paragraph>
                  Analysis results for {selectedInfraType} will be displayed
                  here.
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption">
                  Analysis Progress: 75%
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfrastructureDialog(false)}>Close</Button>
          <Button variant="contained" disabled={!selectedInfraType}>
            Start Analysis
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog}
        onClose={() => setSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Settings color="primary" />
            Settings
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Display Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMiniMap}
                      onChange={(e) => setShowMiniMap(e.target.checked)}
                    />
                  }
                  label="Show Mini Map"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Map Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography gutterBottom>Default Zoom Level</Typography>
                <Slider
                  value={currentCoords.zoom}
                  onChange={(e, newValue) =>
                    setCurrentCoords((prev) => ({ ...prev, zoom: newValue }))
                  }
                  min={1}
                  max={20}
                  marks
                  valueLabelDisplay="auto"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Performance</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Hardware Acceleration"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Smooth Animations"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setSettingsDialog(false);
              addNotification("Settings saved", "success");
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coordinate Search Dialog */}
      <Dialog
        open={coordinateSearchDialog}
        onClose={() => setCoordinateSearchDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Search color="primary" />
            Coordinate Search & Navigation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  defaultValue={wokCoordinates.lat}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Copy">
                        <IconButton size="small">
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  defaultValue={wokCoordinates.lng}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Copy">
                        <IconButton size="small">
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  label="Search Location"
                  placeholder="Enter address or place name"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Recent Searches
                </Typography>
                <Stack spacing={1}>
                  {[
                    "New Delhi, India",
                    "Central Park, NY",
                    "Tower Bridge, London"
                  ].map((location, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.5,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" }
                      }}
                      onClick={() =>
                        addNotification(`Navigated to ${location}`, "success")
                      }
                    >
                      <Typography variant="body2">{location}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Clear />}>Clear</Button>
          <Button startIcon={<Navigation />}>Navigate</Button>
          <Button onClick={() => setCoordinateSearchDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GISDialogs;
