import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { format } from "date-fns";

export default function table({ data = {} }) {
  return (
    <Table striped>
      <TableHead>
        <TableHeadCell>Date</TableHeadCell>
        <TableHeadCell>Staff ID</TableHeadCell>
        <TableHeadCell>Staff Name</TableHeadCell>
        <TableHeadCell>Allowed Late</TableHeadCell>
        <TableHeadCell>First Half</TableHeadCell>
        <TableHeadCell>Second Half</TableHeadCell>
        <TableHeadCell>Current Status</TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {data?.map((report, i) => (
          <TableRow
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
            key={i}
          >
            <TableCell>{format(report.date, "dd-MM-yyyy")}</TableCell>
            <TableCell>{report.staffId?.staffId}</TableCell>
            <TableCell>{report.staffId?.fullName}</TableCell>
            <TableCell>{report.allowedLate ? "Yes" : "No"}</TableCell>
            <TableCell>{report.firstHalf || "-"}</TableCell>
            <TableCell>{report.secondHalf || "-"}</TableCell>
            <TableCell>{report.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
