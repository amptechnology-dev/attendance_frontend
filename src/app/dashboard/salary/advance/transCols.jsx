"use client";
import { format } from "date-fns";
import { Badge } from "flowbite-react";

const typeColor = {
  add: "info",
  deduct: "success",
  update: "warning",
};

const dash = (v) => (v === undefined || v === null || v === "" ? "-" : v);

export const columns = [
  {
    accessorKey: "staff.staffId",
    header: "Staff ID",
    cell: (info) => dash(info.getValue()),
  },
  {
    accessorKey: "staff.fullName",
    header: "Name",
    cell: (info) => dash(info.getValue()),
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: (info) => {
      const { month, year } = info.row.original;
      if (!month || !year) return "-";
      return format(new Date(year, month - 1, 1), "MMM yyyy");
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (info) => (
      <Badge color={typeColor[info.getValue()] || "gray"} className="w-fit">
        {info.getValue()}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => dash(info.getValue()),
  },
  {
    header: "Old",
    cell: (info) => (
      <div>
        <p>
          <strong>Remaining: </strong>
          {dash(info.row.original.previousAmount)}
        </p>
        <p>
          <strong>Months: </strong>
          {dash(info.row.original.previousMonths)}
        </p>
      </div>
    ),
  },
  {
    header: "New",
    cell: (info) => (
      <div>
        <p>
          <strong>Remaining: </strong>
          {dash(info.row.original.newAmount)}
        </p>
        <p>
          <strong>Months: </strong>
          {dash(info.row.original.newMonths)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: (info) => info.getValue() || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: (info) =>
      info.getValue()
        ? format(new Date(info.getValue()), "dd/MM/yyyy hh:mm a")
        : "-",
    enableSorting: false,
  },
];