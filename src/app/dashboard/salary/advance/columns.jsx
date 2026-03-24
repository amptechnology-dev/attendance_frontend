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
      const today = new Date();
      const pauseTill = new Date(info.row.original.advanceSalary?.pauseTill);

      if (!pauseTill) return cellValue;

      const isPaused = pauseTill >= today;
      if (isPaused) {
        return (
          <div className="flex items-center gap-2">
            <span>{cellValue}</span>
            <Badge size="xs">Paused</Badge>
          </div>
        );
      }

      return cellValue;
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
