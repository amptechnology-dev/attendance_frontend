"use client";
import { format } from "date-fns";
import ViewBreakdown from "./viewBreakdown";
import ViewPresentLog from "./viewPresent";

export const columns = [
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
  //   {
  //     accessorKey: "breakTime",
  //     header: "Break Time",
  //     cell: (info) => {
  //       const totalMinutes = info.getValue();
  //       if (totalMinutes <= 0) return "-";
  //       const hours = Math.floor(totalMinutes / 60);
  //       const minutes = totalMinutes % 60;
  //       return `${hours}h ${minutes}m`;
  //     },
  //   },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: (info) => info.getValue(),
  // },
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
          name={info.row.original.staff?.fullName}
          month={info.row.original.month + " - " + info.row.original.year}
          salaryStructure={{
            ...info.row.original.breakdown,
            ...info.row.original.leaves,
          }}
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
