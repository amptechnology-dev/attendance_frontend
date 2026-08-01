"use client";
import { format } from "date-fns";
import ViewBreakdown from "./viewBreakdown";
import ViewPresentLog from "./viewPresent";

// Changed from a static `export const columns = [...]` array to a
// function that accepts the office-wide SalaryStructure, because the
// "Manage" column's ViewBreakdown needs conveyanceSettings (office-wide
// config) to decide whether to show the edit-pen icon — that data isn't
// available at module-load time, only after the page fetches it.
export const getColumns = (officeSalaryStructure) => [
  {
    accessorKey: "month",
    header: "Month",
    cell: (info) => info.getValue() + " - " + info.row.original.year,
  },
  {
    accessorKey: "staff.staffId",
    header: "Staff Id",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "staff.fullName",
    header: "Staff Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "baseSalary",
    header: "Monthly Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "grossSalary",
    header: "Gross Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "deductions",
    header: "Deductions",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "netSalary",
    header: "Net Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: (info) => format(info.getValue(), "dd-MM-yyyy hh:mm a"),
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        <ViewBreakdown
          salaryId={info.row.original._id}
          name={info.row.original.staff?.fullName}
          month={info.row.original.month + " - " + info.row.original.year}
          salaryStructure={{
            ...info.row.original.breakdown,
            ...info.row.original.leaves,
            paidDays: info.row.original.workedDays,
          }}
          conveyanceSettings={officeSalaryStructure?.conveyance}
          presentLogs={info.row.original.attendanceDetails}
        />
        <ViewPresentLog
          name={info.row.original.staff?.fullName}
          month={info.row.original.month + " - " + info.row.original.year}
          presentLogs={info.row.original.attendanceDetails}
          leaveLogs={info.row.original.leaves}
        />
      </div>
    ),
  },
];
