"use client";

export const columns = [
  {
    accessorKey: "localTime",
    header: "Datetime",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "ip",
    header: "IP Address",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "username",
    header: "User",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "authType",
    header: "User Type",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) =>
      info.getValue() == "success" ? (
        <p className="text-green-700">Success</p>
      ) : (
        <p className="text-red-600">Failed</p>
      ),
  },
];
