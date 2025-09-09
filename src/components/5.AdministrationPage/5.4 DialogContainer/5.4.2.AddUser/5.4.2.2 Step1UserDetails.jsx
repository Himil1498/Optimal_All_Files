import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person,
  Lock,
  Email,
  Phone,
  AccountCircle,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

export default function Step1UserDetails({
  userData,
  setUserData,
  allUsers,
  errors,
  setErrors,
  setIsStepValid,
  editingUser,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Step valid if no errors in this step
    const requiredFields = ["username", "fullName", "phone"];
    const hasErrors = requiredFields.some((f) => !userData[f] || errors[f]);
    const passwordsValid =
      !editingUser || userData.password || userData.confirmPassword
        ? !errors.password && !errors.confirmPassword
        : true;

    setIsStepValid(!hasErrors && passwordsValid);
  }, [userData, errors, setIsStepValid, editingUser]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="subtitle1" fontWeight="500">
        User Details{" "}
        <Typography component="span" sx={{ color: "red", fontWeight: "bold" }}>
          *
        </Typography>
      </Typography>

      <Grid container spacing={2}>
        {/* Username */}
        <Grid item xs={12} sm={6} width="49%">
          <TextField
            fullWidth
            label="Username"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: "#0078D7" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Full Name */}
        <Grid item xs={12} sm={6} width="49%">
          <TextField
            fullWidth
            label="Full Name"
            value={userData.fullName}
            onChange={(e) =>
              setUserData({ ...userData, fullName: e.target.value })
            }
            error={!!errors.fullName}
            helperText={errors.fullName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: "#FF6A00" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Password */}
        <Grid item xs={12} sm={6} width="49%">
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "#D32F2F" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Confirm Password */}
        <Grid item xs={12} sm={6} width="49%">
          <TextField
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            value={userData.confirmPassword}
            onChange={(e) =>
              setUserData({ ...userData, confirmPassword: e.target.value })
            }
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "#D32F2F" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12} sm={6} width="49%">
          <TextField
            fullWidth
            label="Phone"
            value={userData.phone}
            onChange={(e) =>
              setUserData({ ...userData, phone: e.target.value })
            }
            error={!!errors.phone}
            helperText={errors.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone sx={{ color: "#388E3C" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6} width="49%">
          <TextField
            fullWidth
            label="Email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: "#1976D2" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Role */}
        <Grid item xs={12} sm={6} width="49%">
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={userData.role}
              onChange={(e) =>
                setUserData({ ...userData, role: e.target.value })
              }
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Normal User">Normal User</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Reporting To Dropdown */}
        <Grid item xs={12} sm={6} width="49%">
          <FormControl fullWidth>
            <InputLabel>Reporting To</InputLabel>
            <Select
              value={userData.reportingTo}
              onChange={(e) =>
                setUserData({ ...userData, reportingTo: e.target.value })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {allUsers
                .filter((u) => u.username !== userData.username) // Prevent self-reporting
                .map((u) => (
                  <MenuItem key={u.username} value={u.username}>
                    {u.fullName || u.username}
                  </MenuItem>
                ))}
            </Select>
            {errors.reportingTo && (
              <FormHelperText error>{errors.reportingTo}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Active Switch */}
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={userData.active}
                onChange={(e) =>
                  setUserData({ ...userData, active: e.target.checked })
                }
                color="success"
              />
            }
            label="Active"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
