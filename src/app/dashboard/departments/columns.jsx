"use client";
import DeleteButton from "./delete";
import EditButton from "./edit";

export const columns = [
  {
    accessorKey: "name",
    header: "Department Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "head",
    header: "Head",
    enableSorting: false,
    cell: (info) => info.getValue() || "-",
  },
  {
    accessorKey: "supervisor",
    header: "Supervisor",
    enableSorting: false,
    cell: (info) => info.getValue() || "-",
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        <EditButton id={info.getValue()} name={info.row.original.name} />
        <DeleteButton id={info.getValue()} />
      </div>
    ),
  },
];
