import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { format } from "date-fns";
import voca from "voca";

export default function table({ data = {} }) {
  return (
    <Table striped>
      <TableHead>
        <TableHeadCell>Date</TableHeadCell>
        <TableHeadCell>Staff ID</TableHeadCell>
        <TableHeadCell>Staff Name</TableHeadCell>
        <TableHeadCell>Type</TableHeadCell>
        <TableHeadCell>Reason</TableHeadCell>
        <TableHeadCell>Date Applied</TableHeadCell>
        <TableHeadCell>Status</TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {data?.report?.map((report) => (
          <TableRow
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
            key={report._id}
          >
            <TableCell>
              {format(report.dateFrom, "dd-MM-yyyy")}{" "}
              {report.dateTo !== report.dateFrom
                ? `to ${format(report.dateTo, "dd-MM-yyyy")}`
                : ""}
            </TableCell>
            <TableCell>{report.staff?.staffId}</TableCell>
            <TableCell>{report.staff?.fullName}</TableCell>
            <TableCell>{voca.capitalize(report.type)}</TableCell>
            <TableCell>{report.reason}</TableCell>
            <TableCell>{format(report.createdAt, "dd-MM-yyyy")}</TableCell>
            <TableCell>{voca.capitalize(report.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
