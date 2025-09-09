import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography
} from "@mui/material";
import { useEffect } from "react";

export default function MarkerEditDialog({
  open,
  editedData,
  setEditedData,
  onSave,
  onClose
}) {
  useEffect(() => {
    if (!editedData.id && editedData.type) {
      const timestamp = Date.now();
      const randomCode = Math.random().toString(36).substr(2, 6);
      const typePrefix = editedData.type === "Sub POP" ? "SPOP" : "POP";

      setEditedData({
        ...editedData,
        id: timestamp,
        unique_id: `${typePrefix}.${randomCode}`,
        network_id: `BHARAT-${typePrefix}.${randomCode}`,
        ref_code: typePrefix === "SPOP" ? "SUB BTS DROP" : "BTS DROP",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        lat: editedData.position?.lat || "",
        lng: editedData.position?.lng || "",
        is_rented: "",
        agreement_start_date: "",
        agreement_end_date: "",
        nature_of_business: "",
        structure_type: "",
        ups_availability: "",
        backup_availability: ""
      });
    }
  }, [editedData, setEditedData]);

  useEffect(() => {
    if (editedData.id) {
      setEditedData((prev) => ({
        ...prev,
        updated_on: new Date().toISOString()
      }));
    }
  }, [
    editedData.name,
    editedData.address,
    editedData.contact_name,
    editedData.contact_no,
    editedData.status
  ]);

  const allFieldsFilled = () => {
    return [
      editedData.id,
      editedData.name,
      editedData.unique_id,
      editedData.network_id,
      editedData.ref_code,
      editedData.status,
      editedData.created_on,
      editedData.updated_on,
      editedData.address,
      editedData.contact_name,
      editedData.contact_no,
      editedData.lat,
      editedData.lng
    ].every((field) => field !== undefined && field !== "");
  };

  const mandatoryLabel = (label) => (
    <Typography component="span">
      {label} <span style={{ color: "red" }}>*</span>
    </Typography>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Marker Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={mandatoryLabel("ID")}
                value={editedData.id || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Name")}
                value={editedData.name || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, name: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Unique ID")}
                value={editedData.unique_id || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Network ID")}
                value={editedData.network_id || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Reference Code")}
                value={editedData.ref_code || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Status")}
                value={editedData.status || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, status: e.target.value })
                }
                margin="normal"
                select
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Planned">Planned</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </TextField>
              <TextField
                fullWidth
                label={mandatoryLabel("Created On")}
                value={editedData.created_on?.split("T")[0] || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Updated On")}
                value={editedData.updated_on?.split("T")[0] || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Latitude")}
                value={editedData.lat || ""}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Longitude")}
                value={editedData.lng || ""}
                disabled
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={mandatoryLabel("Address")}
                value={editedData.address || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, address: e.target.value })
                }
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Contact Name")}
                value={editedData.contact_name || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, contact_name: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label={mandatoryLabel("Contact Number")}
                value={editedData.contact_no || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, contact_no: e.target.value })
                }
                margin="normal"
              />

              {/* Is Rented Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedData.is_rented === "true"}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        is_rented: e.target.checked ? "true" : ""
                      })
                    }
                    color="primary"
                  />
                }
                label="Is Rented"
              />

              {editedData.is_rented === "true" && (
                <>
                  <TextField
                    fullWidth
                    label="Agreement Start Date"
                    type="date"
                    value={editedData.agreement_start_date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        agreement_start_date: e.target.value
                      })
                    }
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Agreement End Date"
                    type="date"
                    value={editedData.agreement_end_date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        agreement_end_date: e.target.value
                      })
                    }
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}

              {/* Optional Fields */}
              <TextField
                fullWidth
                label="Nature of Business"
                value={editedData.nature_of_business || ""}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    nature_of_business: e.target.value
                  })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Structure Type"
                value={editedData.structure_type || ""}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    structure_type: e.target.value
                  })
                }
                margin="normal"
              />

              {/* UPS Availability Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedData.ups_availability === "true"}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        ups_availability: e.target.checked ? "true" : ""
                      })
                    }
                    color="primary"
                  />
                }
                label="UPS Available"
              />

              {/* Backup Availability KVA */}
              <TextField
                fullWidth
                label="Backup Availability (KVA)"
                value={editedData.backup_availability || ""}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    backup_availability: e.target.value
                  })
                }
                margin="normal"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={!allFieldsFilled()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
