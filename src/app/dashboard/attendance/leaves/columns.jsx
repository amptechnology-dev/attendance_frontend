"use client";
import { format } from "date-fns";
import voca from "voca";
import ActionButtons from "./actionButtons";

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
  // {
  //   accessorKey: "staff.fullName",
  //   header: "Month",
  //   cell: (info) => info.getValue(),
  // },
  {
    accessorKey: "dateFrom",
    header: "From Date",
    cell: (info) => format(info.getValue(), "dd-MM-yyyy"),
  },
  {
    accessorKey: "dateTo",
    header: "To Date",
    cell: (info) => format(info.getValue(), "dd-MM-yyyy"),
  },
  {
    accessorKey: "noOfDays",
    header: "Days",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (info) => voca.titleCase(info.getValue()),
    enableSorting: false,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: (info) => info.getValue() || "-",
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
    enableSorting: false,
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    enableSorting: false,
  },
  {
    accessorKey: "_id",
    header: "Action",
    cell: (info) => (
      <ActionButtons
        id={info.getValue()}
        date={info.row.original.dateFrom}
        department={info.row.original.staff.department}
        status={info.row.original.status}
        doc={info.row.original.document}
      />
    ),
    enableSorting: false,
  },
];
