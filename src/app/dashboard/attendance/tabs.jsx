"use client";
import Datatable from "../components/DatatableSimple";
import { columns } from "./columns";
import { Tabs } from "flowbite-react";
import { FiZap, FiClock, FiList, FiCalendar } from "react-icons/fi";
// import AddButton from "./addEntry";
import { filterLogsByDateRange } from "@/lib/helpers";

export default function tabs({ data }) {
  const todayLogs = filterLogsByDateRange(data, "today");
  const yesterdayLogs = filterLogsByDateRange(data, "yesterday");
  const thisMonthLogs = filterLogsByDateRange(data, "thisMonth");

  return (
    <Tabs aria-label="Entry Exit Logs" variant="underline">
      <Tabs.Item title="Today" icon={FiZap}>
        <Datatable
          tableHeading="Today's Logs"
          columns={columns}
          data={todayLogs}
          // Button={<AddButton staffs={staffs} />}
        />
      </Tabs.Item>
      <Tabs.Item title="Yesterday" icon={FiClock}>
        <Datatable
          tableHeading="Yesterday's Logs"
          columns={columns}
          data={yesterdayLogs}
        />
      </Tabs.Item>
      <Tabs.Item title="This Month" icon={FiCalendar}>
        <Datatable
          tableHeading="This Month's Logs"
          columns={columns}
          data={thisMonthLogs}
        />
      </Tabs.Item>
      <Tabs.Item title="90 Days" icon={FiList}>
        <Datatable
          tableHeading="Last 90 Days' Logs"
          columns={columns}
          data={data}
        />
      </Tabs.Item>
    </Tabs>
  );
}
