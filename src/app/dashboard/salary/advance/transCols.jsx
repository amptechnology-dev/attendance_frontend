"use client";
import { format } from "date-fns";

export const columns = [
  {
    accessorKey: "staff.staffId",
    header: "Staff ID",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "staff.fullName",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: (info) =>
      info.getValue() ? `${info.getValue()} - ${info.row.original.year}` : "-",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => info.getValue(),
  },
  {
    header: "Old",
    cell: (info) => (
      <div>
        <p>
          <strong>Remaining: </strong>
          {info.row.original.previousAmount}
        </p>
        <p>
          <strong>Months: </strong>
          {info.row.original.previousMonths}
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
          {info.row.original.newAmount}
        </p>
        <p>
          <strong>Months: </strong>
          {info.row.original.newMonths}
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
    cell: (info) => format(info.getValue(), "dd/MM/yyyy hh:mm a"),
    enableSorting: false,
  },
];
