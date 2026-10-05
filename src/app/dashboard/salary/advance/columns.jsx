"use client";
import EditButton from "./edit";
import PaidButton from "./paid";
import { format } from "date-fns";
import { Badge } from "flowbite-react";

export const columns = [
  {
    accessorKey: "staffId",
    header: "Staff ID",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "fullName",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "advanceSalary.totalAmount",
    header: "Total Amount",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "advanceSalary.remainingAmount",
    header: "Remaining Amount",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "advanceSalary.remainingMonths",
    header: "Remaining Months",
    cell: (info) => {
      const cellValue = info.getValue();
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear();
      const isPaused = (
        info.row.original.advanceSalary?.pausedMonths || []
      ).some((p) => p.month === curMonth && p.year === curYear);

      if (!isPaused) return cellValue;

      return (
        <div className="flex items-center gap-2">
          <span>{cellValue}</span>
          <Badge size="xs" color="warning">
            Paused
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "advanceSalary.monthlyDeduction",
    header: "Monthly Amount",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "_id",
    header: "#",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        <EditButton staff={info.row.original} />
        <PaidButton staffId={info.getValue()} />
      </div>
    ),
  },
];
