import { useEffect, useState, useRef } from "react";
import { AppBar, Toolbar, Box, Avatar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./2.2 Logo";
import NavLinks from "./2.3 NavLinks";
import ProfileMenu from "./2.4 ProfileMenu";
import MobileDrawer from "./2.5 MobileDrawer";
import { logout } from "../../redux/authSlice";

const isDevMode =
  import.meta.env.VITE_USE_MOCK === "true" ||
  import.meta.env.VITE_USE_MOCK === undefined;

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginTime } = useSelector((state) => state.auth);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [elapsed, setElapsed] = useState("00:00:00");
  const intervalRef = useRef(null);

  // Helper: calculate elapsed time string
  const computeElapsed = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const hrs = String(Math.floor(diff / 3600)).padStart(2, "0");
    const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const secs = String(diff % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const updateElapsed = () => {
    const storedTime = loginTime || sessionStorage.getItem("loginTime");
    if (storedTime) setElapsed(computeElapsed(storedTime));
  };

  const formattedDate = (() => {
    const storedTime = loginTime || sessionStorage.getItem("loginTime");
    if (!storedTime) return "";
    return new Date(storedTime).toLocaleDateString("en-GB");
  })();

  useEffect(() => {
    if (!user) return;

    // initialize immediately
    updateElapsed();

    // clear previous interval
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(updateElapsed, 1000);

    // Handle page visibility
    const handleVisibilityChange = () => {
      clearInterval(intervalRef.current);
      if (!document.hidden)
        intervalRef.current = setInterval(updateElapsed, 1000);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, loginTime]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Network", path: "/network" },
    ...(user?.role === "Admin"
      ? [{ label: "Administration", path: "/administration" }]
      : []),
  ];

  return (
    <AppBar
      position="static"
      elevation={3}
      sx={{
        background: "linear-gradient(90deg, #0078D7, #FF6A00)",
        color: "white",
      }}
    >
      <Toolbar sx={{ position: "relative" }}>
        {windowWidth <= 900 && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Logo isDevMode={isDevMode} />
        {windowWidth > 900 && (
          <NavLinks links={navLinks} location={location} navigate={navigate} />
        )}
        {windowWidth > 550 ? (
          <ProfileMenu
            user={user}
            loginTime={loginTime || sessionStorage.getItem("loginTime")}
            handleLogout={handleLogout}
          />
        ) : (
          <Box ml="auto">
            <Avatar sx={{ bgcolor: "white", color: "#0078D7" }}>
              {user?.username?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </Box>
        )}
        <MobileDrawer
          open={drawerOpen}
          toggleDrawer={toggleDrawer}
          links={navLinks}
          user={user}
          elapsed={elapsed}
          formattedDate={formattedDate}
          handleLogout={handleLogout}
          location={location}
          navigate={navigate}
        />
      </Toolbar>
    </AppBar>
  );
}
