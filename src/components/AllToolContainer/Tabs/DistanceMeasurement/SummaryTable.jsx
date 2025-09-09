import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

export default function SummaryTable({ segments = [] }) {
  if (!segments.length) {
    return <Typography variant="body2">No measurements yet</Typography>;
  }

  const total = segments
    .filter((s) => s.index !== "Total")
    .reduce((acc, s) => acc + parseFloat(s.distance), 0);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Summary</TableCell>
          <TableCell align="right">Distance (km)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Total Distance</TableCell>
          <TableCell align="right">{total.toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
