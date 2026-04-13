"use client";
// import EditButton from "./edit";
import { format } from "date-fns";
import ViewLogsButton from "./viewLogs";
import HrAdjustmentButton from "./hrAdjustment";
import { Badge } from "flowbite-react";

export const columns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => format(info.getValue(), "dd-MM-yyyy"),
  },
  {
    accessorKey: "staffId.staffId",
    header: "Staff Id",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "staffId.fullName",
    header: "Staff Name",
    cell: (info) => info.getValue(),
  },
  {
    header: "Time",
    cell: ({ row }) => {
      const logs = row.original.logs;
      if (logs && logs.length > 0) {
        const entryTime = format(logs[0].entryTime, "hh:mma");
        const exitTime = logs[logs.length - 1].exitTime
          ? format(logs[logs.length - 1].exitTime, "hh:mma")
          : "[No Exit]";
        return `${entryTime} - ${exitTime}`;
      }
      return "-";
    },
  },
  {
    accessorKey: "allowedLate",
    header: "Late",
    cell: (info) =>
      info.getValue() ? (
        <Badge color="warning" size="xs">
          Late Entry
        </Badge>
      ) : (
        "-"
      ),
  },
  {
    accessorKey: "firstHalf",
    header: "1st Half",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "secondHalf",
    header: "2nd Half",
    cell: (info) => info.getValue(),
  },
  // {
  //   accessorKey: "entryTime",
  //   header: "Entry Time",
  //   cell: (info) => format(info.getValue(), "hh:mm a"),
  // },
  {
    accessorKey: "totalWorkTime",
    header: "Work Time",
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
  // {
  //   accessorKey: "breakTime",
  //   header: "Break Time",
  //   cell: (info) => {
  //     const totalMinutes = info.getValue();
  //     if (totalMinutes <= 0) return "-";
  //     const hours = Math.floor(totalMinutes / 60);
  //     const minutes = totalMinutes % 60;
  //     return `${hours}h ${minutes}m`;
  //   },
  // },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      const isPaidLeave = info.row.original.leaveStatus === "paid";
      if (status === "absent") {
        return (
          <Badge color={isPaidLeave ? "warning" : "failure"} size="xs">
            {isPaidLeave ? "Paid Leave" : "Absent"}
          </Badge>
        );
      } else if (status === "full-day") {
        return (
          <Badge color="success" size="xs">
            Full Day
          </Badge>
        );
      } else if (status === "half-day") {
        return (
          <Badge color="indigo" size="xs">
            Half Day
          </Badge>
        );
      } else if (status === "present") {
        return (
          <Badge color="info" size="xs">
            Present
          </Badge>
        );
      } else {
        return (
          <Badge color="light" size="xs">
            {status}
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "hrAdjustments.adjustments",
    header: "Adjusment",
    cell: (info) =>
      info.row.original.isOffDayWork ? "Off Day Duty" : info.getValue() || "-",
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        <ViewLogsButton
          logs={info.row.original.logs}
          name={info.row.original.staffId?.fullName}
        />
        <HrAdjustmentButton id={info.getValue()} data={info.row.original} />
        {/* <EditButton data={info.row.original} /> */}
        {/* <DeleteButton id={info.getValue()} /> */}
      </div>
    ),
  },
];
