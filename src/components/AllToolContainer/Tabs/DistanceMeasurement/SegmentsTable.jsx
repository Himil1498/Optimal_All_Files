import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

export default function SegmentTable({ segments }) {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Distance (km)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {segments.map((seg) => (
            <TableRow key={seg.index}>
              <TableCell>{seg.index}</TableCell>
              <TableCell>{seg.from}</TableCell>
              <TableCell>{seg.to}</TableCell>
              <TableCell>{seg.distance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
