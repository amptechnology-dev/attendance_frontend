"use client";
// import EditButton from "./edit";
import { format } from "date-fns";
// import DeleteButton from "./delete";
import AddExitButton from "./addExit";
import EditEntryButton from "./editEntry";

export const columns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => format(info.getValue(), "dd-MM-yyyy"),
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
    accessorKey: "slNo",
    header: "SL No",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "entryTime",
    header: "Entry Time",
    cell: (info) =>
      info.row.original.exitTime ? (
        format(info.getValue(), "hh:mm a")
      ) : (
        <div className="flex gap-2 items-center">
          {format(info.getValue(), "hh:mm a")}
          <EditEntryButton data={info.row.original} />
        </div>
      ),
  },
  {
    accessorKey: "exitTime",
    header: "Exit Time",
    cell: (info) =>
      info.getValue() ? (
        format(info.getValue(), "hh:mm a")
      ) : (
        <AddExitButton
          logId={info.row.original._id}
          date={info.row.original.date}
          entryTime={info.row.original.entryTime}
        />
      ),
  },
  {
    accessorKey: "workingTime",
    header: "Working Time",
    cell: (info) => {
      const totalMinutes = info.getValue();
      if (totalMinutes <= 0) return "-";
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      
      if (hours > 0 && minutes > 0) {
        return `${hours} hours ${minutes} minutes`;
      } else if (hours > 0) {
        return `${hours} hours`;
      } else if (minutes > 0) {
        return `${minutes} minutes`;
      }
      return "-";
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: (info) => info.getValue() || "-",
  },
  //   {
  //     accessorKey: "_id",
  //     header: "Manage",
  //     enableSorting: false,
  //     cell: (info) => (
  //       <div className="flex gap-2">
  //         {/* <EditButton data={info.row.original} /> */}
  //         {/* <DeleteButton id={info.getValue()} /> */}
  //       </div>
  //     ),
  //   },
];
