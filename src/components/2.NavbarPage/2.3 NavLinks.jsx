import { Box, Typography } from "@mui/material";

export default function NavLinks({ links, location, navigate }) {
  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 4,
      }}
    >
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Typography
            key={link.label}
            variant="body1"
            fontWeight="500"
            sx={{
              cursor: "pointer",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                bottom: -2,
                width: "100%",
                height: 2,
                backgroundColor: isActive ? "orange" : "transparent",
                transition: "all 0.3s ease",
              },
              "&:hover::after": { backgroundColor: "rgba(218,156,97,0.6)" },
            }}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </Typography>
        );
      })}
    </Box>
  );
}
