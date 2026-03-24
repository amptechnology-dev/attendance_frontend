"use client";

export const columns = [
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
    accessorKey: "month",
    header: "Month",
    cell: (info) => info.getValue() + " - " + info.row.original.year,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => info.getValue(),
  },
];
