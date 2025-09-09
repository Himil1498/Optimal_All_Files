import { Box, useTheme, useMediaQuery } from "@mui/material";
import logInImg from "../../../src/assets/logo8.jpg";

export default function LeftImage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs/small devices

  return (
    <Box
      sx={{
        width: {
          xs: "100%", // full width on mobile
          sm: "35%",
          md: "45%",
          lg: "55%",
          xl: "65%",
        },
        minWidth: {
          sm: "280px",
          md: "350px",
          lg: "400px",
        },
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${logInImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxShadow: theme.shadows[8],
        borderRight: isMobile ? "none" : `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(["transform", "box-shadow"], {
          duration: theme.transitions.duration.standard,
          easing: theme.transitions.easing.easeInOut,
        }),
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: isMobile
            ? `linear-gradient(to bottom, ${theme.palette.primary.main}33, ${theme.palette.secondary.main}22)`
            : `
            linear-gradient(
              135deg,
              ${theme.palette.primary.main}15 0%,
              ${theme.palette.secondary.main}10 50%,
              ${theme.palette.primary.dark}05 100%
            )`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Floating circle accent */}
      {!isMobile && (
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            right: "8%",
            width: { sm: "60px", md: "80px", lg: "100px" },
            height: { sm: "60px", md: "80px", lg: "100px" },
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.palette.background.paper}40, ${theme.palette.background.paper}10)`,
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            zIndex: 3,
            animation: "float 6s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-20px)" },
            },
          }}
        />
      )}

      {/* Pulsing rectangle accent */}
      {!isMobile && (
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            left: "5%",
            width: { sm: "40px", md: "60px", lg: "80px" },
            height: { sm: "40px", md: "60px", lg: "80px" },
            borderRadius: "12px",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}20)`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${theme.palette.primary.light}50`,
            zIndex: 3,
            animation: "pulse 4s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
              "50%": { opacity: 0.8, transform: "scale(1.05)" },
            },
          }}
        />
      )}
    </Box>
  );
}
