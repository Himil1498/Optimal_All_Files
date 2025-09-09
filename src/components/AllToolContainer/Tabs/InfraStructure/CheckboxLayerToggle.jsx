import { FormControlLabel, Checkbox } from "@mui/material";

export default function CheckboxLayerToggle({ label, checked, onChange }) {
  return (
    <FormControlLabel
      control={
        <Checkbox checked={checked} onChange={onChange} color="primary" />
      }
      label={label}
    />
  );
}
