"use client";
// import EditButton from "./edit";
import { format, differenceInSeconds } from "date-fns";
import { minutesToHM } from "@/lib/helpers";
import ViewLogsButton from "./viewLogs";
import HrAdjustmentButton from "./hrAdjustment";
import { Badge, Tooltip } from "flowbite-react";

// সেকেন্ড থেকে "Xh Ym Zs" ফরম্যাটে দেখানোর জন্য helper
const formatHMS = (totalSeconds) => {
  if (totalSeconds == null || totalSeconds < 0) return "-";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

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
        const firstLog = logs[0];
        const lastLog = logs[logs.length - 1];

        const entryTime = format(firstLog.entryTime, "hh:mma");
        const exitTime = lastLog.exitTime
          ? format(lastLog.exitTime, "hh:mma")
          : "[No Exit]";

        const entryExact = format(firstLog.entryTime, "hh:mm:ss a");
        const exitExact = lastLog.exitTime
          ? format(lastLog.exitTime, "hh:mm:ss a")
          : "[No Exit]";

        return (
          <Tooltip content={`Entry: ${entryExact}  |  Exit: ${exitExact}`}>
            <span className="cursor-help border-b border-dotted border-gray-400">
              {entryTime} - {exitTime}
            </span>
          </Tooltip>
        );
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
  {
    accessorKey: "totalWorkTime",
    header: "Work Time",
    cell: ({ row }) => {
      const totalMinutes = row.original.totalWorkTime;
      const logs = row.original.logs;

      const display = minutesToHM(totalMinutes);

      // FIX: সব session মিলিয়ে exact সেকেন্ড-precision total বের করা হচ্ছে,
      // যাতে hover করলে দেখা যায় ৩৪ মিনিট কেন, ৩৫ না — exact সেকেন্ড সহ প্রমাণ
      let exactSeconds = 0;
      let hasCompletedSession = false;
      if (logs && logs.length > 0) {
        logs.forEach((log) => {
          if (log.exitTime) {
            exactSeconds += differenceInSeconds(log.exitTime, log.entryTime);
            hasCompletedSession = true;
          }
        });
      }

      if (!hasCompletedSession) return display;

      return (
        <Tooltip content={`Exact: ${formatHMS(exactSeconds)}`}>
          <span className="cursor-help border-b border-dotted border-gray-400">
            {display}
          </span>
        </Tooltip>
      );
    },
  },
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