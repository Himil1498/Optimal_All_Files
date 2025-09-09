import { useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";

export default function Step2Permissions({
  userData,
  setUserData,
  errors,
  setIsStepValid,
}) {
  useEffect(() => {
    setIsStepValid(Boolean(userData.permissions) && !errors.permissions);
  }, [userData.permissions, errors, setIsStepValid]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Assign Permissions{" "}
        <Typography
          component="span"
          sx={{ color: "red", fontWeight: 700, ml: 0.2 }}
        >
          *
        </Typography>
      </Typography>

      <FormControl
        fullWidth
        error={Boolean(errors.permissions)}
        sx={{
          "& .MuiInputLabel-root": { color: "#555" },
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
      >
        <InputLabel id="permissions-label">Permission</InputLabel>
        <Select
          labelId="permissions-label"
          value={userData.permissions || ""}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, permissions: e.target.value }))
          }
        >
          <MenuItem value="read">Read</MenuItem>
          <MenuItem value="write">Write</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
        {errors.permissions && (
          <FormHelperText>{errors.permissions}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
}
