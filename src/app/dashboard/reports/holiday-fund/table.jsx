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
        <TableHeadCell>Month</TableHeadCell>
        <TableHeadCell>Staff ID</TableHeadCell>
        <TableHeadCell>Staff Name</TableHeadCell>
        <TableHeadCell>Amount</TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {data?.report?.map((report) => (
          <TableRow
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
            key={report._id}
          >
            <TableCell>
              {format(new Date(report.year, report.month - 1), "MMM - yyyy")}
            </TableCell>
            <TableCell>{report.staff?.staffId}</TableCell>
            <TableCell>{report.staff?.fullName}</TableCell>
            <TableCell>{report.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
