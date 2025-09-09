// src/components/Layout.jsx
import Navbar from "./2.1 NavbarMain";
import { Box } from "@mui/material";

export default function Layout({ children }) {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Top Navbar */}
      <Navbar />

      {/* Page Content */}
      <Box flexGrow={1} margin={0} padding={0}>
        {children}
      </Box>
    </Box>
  );
}
