"use client";
// import DeleteButton from "./delete";
// import EditButton from "./edit";
import { formatDate } from "date-fns";
import v from "voca";

export const columns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDate(info.getValue(), "dd/MM/yyyy"),
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
    accessorKey: "workType",
    header: "Work Type",
    enableSorting: false,
    cell: (info) => v.titleCase(info.getValue()),
  },
  {
    accessorKey: "benifit",
    header: "Benefit",
    enableSorting: false,
    cell: (info) => v.titleCase(info.getValue()),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    enableSorting: false,
    cell: (info) => info.getValue() || "-",
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        {/* <EditButton id={info.getValue()} name={info.row.original.name} /> */}
        {/* <DeleteButton id={info.getValue()} /> */}
      </div>
    ),
  },
];
