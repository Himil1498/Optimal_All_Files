import React from "react";
import {
  Grid,
  Typography,
  Button,
  Autocomplete,
  TextField,
  Box,
  Chip,
} from "@mui/material";
import { getAllDisplayNames } from "../../../../utils/regionUtils";

const INDIA_REGIONS = getAllDisplayNames().filter(
  (name) => name !== "Bharat (All India)"
);

export default function Step3Regions({ userData, setUserData }) {
  const handleSelectAll = () =>
    setUserData({ ...userData, regions: ["Bharat"] });
  const handleClearAll = () => setUserData({ ...userData, regions: [] });

  const handleChange = (_, newValue) => {
    if (newValue.length === INDIA_REGIONS.length) {
      setUserData({ ...userData, regions: ["Bharat"] });
    } else {
      setUserData({ ...userData, regions: newValue });
    }
  };

  const displayValue = userData.regions?.includes("Bharat")
    ? ["Bharat (All India)"]
    : userData.regions || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assign Regions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} width="100%">
          <Autocomplete
            multiple
            options={INDIA_REGIONS}
            value={displayValue}
            onChange={handleChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Select Regions" />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectAll}
            sx={{ mr: 2 }}
          >
            Select All
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClearAll}>
            Clear All
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
