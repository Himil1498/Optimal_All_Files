import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";

export default function TableSkeleton({ rows = 5 }) {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {[
              "",
              "Username",
              "Full Name",
              "Role",
              "Phone",
              "Email",
              "Regions",
              "Status",
              "Last Login",
              "Actions",
            ].map((col, idx) => (
              <TableCell key={idx}>
                <Skeleton variant="text" width={col ? 80 : 20} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 10 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton variant="text" width={j === 0 ? 20 : 80} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
