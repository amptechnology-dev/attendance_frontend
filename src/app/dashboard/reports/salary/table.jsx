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
        <TableHeadCell>Base Salary</TableHeadCell>
        <TableHeadCell>Gross Salary</TableHeadCell>
        <TableHeadCell>Other Deduction</TableHeadCell>
        <TableHeadCell>Net Salary</TableHeadCell>
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
            <TableCell>{report.baseSalary}</TableCell>
            <TableCell>{report.grossSalary} </TableCell>
            <TableCell>{report.deductions}</TableCell>
            <TableCell>{report.netSalary}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
