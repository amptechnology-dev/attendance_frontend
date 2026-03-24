import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { format } from "date-fns";
import { minutesToHM } from "@/lib/helpers";

export default function table({ data = {} }) {
  return (
    <Table striped>
      <TableHead>
        <TableHeadCell>Date</TableHeadCell>
        <TableHeadCell>Staff ID</TableHeadCell>
        <TableHeadCell>Staff Name</TableHeadCell>
        <TableHeadCell>Working Time</TableHeadCell>
        <TableHeadCell>Break Time</TableHeadCell>
        <TableHeadCell>Status</TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {data?.report?.map((report) => (
          <TableRow
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
            key={report._id}
          >
            <TableCell>{format(report.date, "dd-MM-yyyy")}</TableCell>
            <TableCell>{report.staffId?.staffId}</TableCell>
            <TableCell>{report.staffId?.fullName}</TableCell>
            <TableCell>{minutesToHM(report.totalWorkTime)}</TableCell>
            <TableCell>{minutesToHM(report.breakTime)}</TableCell>
            <TableCell>{report.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
