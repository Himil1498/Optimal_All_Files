// import {
//   Typography,
//   Tooltip,
//   Box,
//   Avatar,
//   Menu,
//   MenuItem,
// } from "@mui/material";
// import { Logout } from "@mui/icons-material";

// import { motion, AnimatePresence } from "framer-motion";

// // ---------------- User Profile Component ----------------
// export const UserProfile = ({
//   open,
//   user,
//   onClick,
//   anchorEl,
//   handleCloseMenu,
//   handleLogout,
// }) => (
//   <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//     <Tooltip
//       title={!open ? `${user?.username} (${user?.role})` : ""}
//       placement="right"
//       arrow
//     >
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: open ? 1 : 0,
//           justifyContent: open ? "flex-start" : "center",
//           p: 1,
//           borderRadius: 2,
//           "&:hover": {
//             backgroundColor: "rgba(255,255,255,0.12)",
//             cursor: "pointer",
//           },
//           transition: "all 0.3s",
//         }}
//         onClick={onClick}
//       >
//         <Avatar sx={{ width: 32, height: 32 }}>{user?.username?.[0]}</Avatar>
//         <AnimatePresence>
//           {open && (
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//             >
//               <Box>
//                 <Typography variant="body1" sx={{ fontWeight: "bold" }}>
//                   {user?.username || "User"}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
//                 >
//                   {user?.role || "Role"}
//                 </Typography>
//               </Box>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </Box>
//     </Tooltip>

//     <Menu
//       anchorEl={anchorEl}
//       open={Boolean(anchorEl)}
//       onClose={handleCloseMenu}
//     >
//       <MenuItem onClick={handleLogout}>
//         <Logout sx={{ mr: 1, color: "#F87171" }} /> Logout
//       </MenuItem>
//     </Menu>
//   </Box>
// );

import {
  Typography,
  Tooltip,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

export const UserProfile = ({
  open,
  user,
  onClick,
  anchorEl,
  handleCloseMenu,
  handleLogout,
}) => {
  const hasRegions = user?.regions && user.regions.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Tooltip
        title={!open ? `${user?.username} (${user?.role})` : ""}
        placement="right"
        arrow
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: open ? 1 : 0,
            justifyContent: open ? "flex-start" : "center",
            p: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.12)",
              cursor: "pointer",
            },
            transition: "all 0.3s",
          }}
          onClick={onClick}
        >
          <Avatar sx={{ width: 32, height: 32 }}>{user?.username?.[0]}</Avatar>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {user?.username || "User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                  >
                    {user?.role || "Role"}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Tooltip>

      {/* 🔹 Assigned Regions or All India */}
      {open &&
        (hasRegions ? (
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {user.regions.map((region, idx) => (
              <Chip
                key={idx}
                label={region}
                size="small"
                sx={{
                  fontSize: 11,
                  backgroundColor: "rgba(59,130,246,0.15)",
                  color: "#93c5fd",
                  borderRadius: 1,
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: 12,
              color: "#93c5fd",
              px: 1,
              mt: 0.5,
            }}
          >
            🌍 Access: All India
          </Typography>
        ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1, color: "#F87171" }} /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};
