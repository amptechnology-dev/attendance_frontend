"use client";
import SetActiveButton from "./setMonth";
import { Badge } from "flowbite-react";
import EditButton from "./editMonth";
import { formatDate } from "date-fns";

export const columns = [
  {
    accessorKey: "monthNumber",
    header: "Month",
    cell: (info) => {
      const monthName = new Date(0, info.getValue() - 1)?.toLocaleString(
        "default",
        {
          month: "long",
        }
      );

      return (
        <div className="flex gap-2 flex-wrap">
          {monthName} - {info.getValue()}
          {info.row.original.isCurrentMonth && (
            <Badge color="success" size="xs">
              Current
            </Badge>
          )}
          {info.row.original.isPreviousMonth && (
            <Badge color="indigo" size="xs">
              Previous
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "financialYear.yearLabel",
    header: "Financial Year",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: (info) => formatDate(info.getValue(), "dd/MM/yyyy"),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: (info) => formatDate(info.getValue(), "dd/MM/yyyy"),
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        {!info.row.original.isCurrentMonth && (
          <SetActiveButton id={info.getValue()} />
        )}
        <EditButton data={info.row.original} />
        {/* <DeleteButton id={info.getValue()} /> */}
      </div>
    ),
  },
];
