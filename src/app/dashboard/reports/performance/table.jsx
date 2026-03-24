import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
// import { minutesToHM } from "@/lib/helpers";

export default function table({ data = [] }) {
  return (
    <Table striped>
      <TableHead>
        <TableHeadCell>Sl</TableHeadCell>
        <TableHeadCell>Staff ID</TableHeadCell>
        <TableHeadCell>Staff Name</TableHeadCell>
        <TableHeadCell>Full Days</TableHeadCell>
        <TableHeadCell>Half Days</TableHeadCell>
        <TableHeadCell>Absents</TableHeadCell>
        <TableHeadCell>Paid Leaves</TableHeadCell>
        <TableHeadCell>Unpaid Leaves</TableHeadCell>
      </TableHead>
      <TableBody className="divide-y">
        {data?.map((report, index) => (
          <TableRow
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
            key={report._id}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{report.staff?.staffId}</TableCell>
            <TableCell>{report.staff?.fullName}</TableCell>
            <TableCell>{report.fullDays}</TableCell>
            <TableCell>{report.halfDays}</TableCell>
            <TableCell>{report.absents}</TableCell>
            <TableCell>{report.paidLeaves}</TableCell>
            <TableCell>{report.unpaidLeaves}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
