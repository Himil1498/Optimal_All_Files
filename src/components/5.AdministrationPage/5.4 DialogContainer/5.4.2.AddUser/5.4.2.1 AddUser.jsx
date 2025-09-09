// AddUser.js
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import Step1UserDetails from "./5.4.2.2 Step1UserDetails";
import Step2Permissions from "./5.4.2.3 Step2Permissions";
import Step3Regions from "./5.4.2.4 Step3Regions";

const steps = [
  "Add / Update user details",
  "Select user permissions",
  "Assign regions current user can access",
];

const isDevMode =
  import.meta.env.VITE_USE_MOCK === "true" ||
  import.meta.env.VITE_USE_MOCK === undefined;

export default function AddUser({ onClose, editingUser }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    email: "",
    role: "Normal User",
    reportingTo: "",
    active: true,
    permissions: "",
    regions: [],
  });

  const [errors, setErrors] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [isStepValid, setIsStepValid] = useState(false);

  // Load all users + editingUser
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setAllUsers(storedUsers);

    if (editingUser) {
      setUserData({
        ...editingUser,
        password: "",
        confirmPassword: "",
        regions: editingUser.regions || [],
      });
    }
  }, [editingUser]);

  // Validate current step
  const validateStep = () => {
    let tempErrors = {};
    if (activeStep === 0) {
      if (!userData.username) tempErrors.username = "Username is required";
      else if (
        !editingUser &&
        allUsers.some((u) => u.username === userData.username)
      )
        tempErrors.username = "Username already exists";

      if (!userData.fullName) tempErrors.fullName = "Full Name is required";

      if (!editingUser || userData.password || userData.confirmPassword) {
        if (!userData.password) tempErrors.password = "Password is required";
        if (!userData.confirmPassword)
          tempErrors.confirmPassword = "Confirm Password is required";
        if (
          userData.password &&
          userData.confirmPassword &&
          userData.password !== userData.confirmPassword
        )
          tempErrors.confirmPassword = "Passwords do not match";
      }

      if (!userData.phone) tempErrors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(userData.phone))
        tempErrors.phone = "Phone number must be 10 digits";

      if (userData.email && !/^\S+@\S+\.\S+$/.test(userData.email))
        tempErrors.email = "Invalid email format";
    } else if (activeStep === 1) {
      if (!userData.permissions) tempErrors.permissions = "Select a permission";
    } else if (activeStep === 2) {
      if (!userData.regions.length)
        tempErrors.regions = "Select at least one region";
    }

    setErrors(tempErrors);
    setIsStepValid(Object.keys(tempErrors).length === 0);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSave = async () => {
    if (!validateStep()) return;
    const payload = { ...userData, regions: userData.regions || [] };

    if (isDevMode) {
      let updatedUsers;
      if (editingUser) {
        updatedUsers = allUsers.map((u) =>
          u.username === editingUser.username
            ? { ...u, ...payload, password: payload.password || u.password }
            : u
        );
      } else {
        updatedUsers = [...allUsers, payload];
      }

      // ✅ Save to localStorage for persistence
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      onClose(
        true,
        editingUser ? "User updated successfully" : "User added successfully",
        "success"
      );
      return;
    }

    try {
      let res;
      if (editingUser) {
        res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/users/${editingUser.username}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        onClose(
          true,
          editingUser ? "User updated successfully" : "User added successfully",
          "success"
        );
      } else {
        onClose(false, data.message || "Failed to save user", "error");
      }
    } catch (err) {
      console.error(err);
      onClose(false, "Error saving user", "error");
    }
  };

  return (
    <Card
      sx={{
        mt: 2,
        boxShadow: 3,
        borderRadius: 2,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {editingUser ? "Edit User" : "Add New User"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? "vertical" : "horizontal"}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Step1UserDetails
            userData={userData}
            setUserData={setUserData}
            allUsers={allUsers}
            errors={errors}
            setErrors={setErrors}
            setIsStepValid={setIsStepValid}
            editingUser={editingUser}
          />
        )}
        {activeStep === 1 && (
          <Step2Permissions
            userData={userData}
            setUserData={setUserData}
            errors={errors}
            setIsStepValid={setIsStepValid}
          />
        )}
        {activeStep === 2 && (
          <Step3Regions
            userData={userData}
            setUserData={setUserData}
            errors={errors}
            setIsStepValid={setIsStepValid}
          />
        )}

        <Box
          mt={4}
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Button
            color="error"
            onClick={activeStep === 0 ? () => onClose(false) : handleBack}
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!isStepValid}
            >
              {editingUser ? "Update User" : "Save User"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!isStepValid}
            >
              Next
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
