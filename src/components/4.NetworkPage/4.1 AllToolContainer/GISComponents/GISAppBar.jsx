import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  ButtonGroup,
  Chip,
  Tooltip,
  Badge,
  LinearProgress,
  Autocomplete,
  useTheme,
  alpha
} from "@mui/material";
import {
  Menu as MenuIcon,
  Map as MapIcon,
  Search as SearchIcon,
  Upload,
  Download,
  Settings,
  Notifications,
  DarkMode,
  LightMode,
  Save,
  Undo,
  Redo
} from "@mui/icons-material";
import ProfileMenu from "../../../2.NavbarPage/2.4 ProfileMenu";

const GISAppBar = ({
  darkMode,
  sidebarOpen,
  setSidebarOpen,
  searchValue,
  setSearchValue,
  sampleSearchSuggestions,
  handleUndo,
  handleRedo,
  historyIndex,
  actionHistory,
  notifications,
  setDarkMode,
  setSettingsDialog,
  addNotification,
  mapLoading,
  user,
  loginTime,
  handleLogout
}) => {
  const theme = useTheme();

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: darkMode ? "grey.900" : "primary.dark",
          backdropFilter: "blur(10px)"
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <MapIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GIS Dashboard
            <Chip
              label="Pro"
              size="small"
              color="success"
              sx={{ ml: 1, fontSize: "0.7rem" }}
            />
          </Typography>

          {/* Enhanced Search */}
          <Autocomplete
            freeSolo
            options={sampleSearchSuggestions}
            value={searchValue}
            onInputChange={(event, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Search locations..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{
                  mr: 2,
                  width: 300,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    "& fieldset": {
                      borderColor: alpha(theme.palette.common.white, 0.3)
                    },
                    "& input": { color: "white" },
                    "&:hover fieldset": {
                      borderColor: alpha(theme.palette.common.white, 0.5)
                    }
                  }
                }}
              />
            )}
            sx={{ mr: 2 }}
          />

          {/* Action Buttons */}
          <ButtonGroup variant="outlined" sx={{ mr: 1 }}>
            <Tooltip title="Undo (Ctrl+Z)">
              <Button
                startIcon={<Undo />}
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Undo
              </Button>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <Button
                startIcon={<Redo />}
                onClick={handleRedo}
                disabled={historyIndex >= actionHistory.length - 1}
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Redo
              </Button>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup variant="outlined" sx={{ mr: 1 }}>
            <Tooltip title="Import Data">
              <Button
                startIcon={<Upload />}
                onClick={() =>
                  addNotification("Import feature coming soon", "info")
                }
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Import
              </Button>
            </Tooltip>
            <Tooltip title="Export Map">
              <Button
                startIcon={<Download />}
                onClick={() =>
                  addNotification("Export feature coming soon", "info")
                }
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Save Project">
              <Button
                startIcon={<Save />}
                onClick={() =>
                  addNotification("Project saved successfully", "success")
                }
                sx={{
                  color: "white",
                  borderColor: alpha(theme.palette.common.white, 0.3)
                }}
              >
                Save
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle Theme">
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={() => setSettingsDialog(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
          <ProfileMenu
            user={user}
            loginTime={loginTime || sessionStorage.getItem("loginTime")}
            handleLogout={() => handleLogout()}
          />
        </Toolbar>

        {/* Progress bar for loading operations */}
        {mapLoading && <LinearProgress />}
      </AppBar>
    </>
  );
};

export default GISAppBar;
