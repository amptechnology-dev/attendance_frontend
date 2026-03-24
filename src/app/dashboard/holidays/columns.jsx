"use client";
// import EditButton from "./editMonth";
import { formatDate } from "date-fns";
import DeleteButton from "./delete";

export const columns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDate(info.getValue(), "dd-MM-yyyy"),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "department.name",
    header: "Department",
    cell: (info) =>
      info.row.original.forAllDepartments ? "All" : info.getValue(),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: (info) => info.getValue() || "-",
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        {/* <EditButton data={info.row.original} /> */}
        <DeleteButton id={info.getValue()} />
      </div>
    ),
  },
];
