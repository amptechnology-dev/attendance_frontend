"use client";
import Datatable from "../../components/DatatableSimple";
import { columns } from "./columns";
import { Tabs } from "flowbite-react";
import { FiZap, FiClock, FiList } from "react-icons/fi";
import { formatDate } from "date-fns";
import NewApplication from "./newApplication";

export default function tabs({ data }) {
  const filterLogsByMonth = (logs, targetMonth) => {
    return logs?.filter((log) => {
      return (
        formatDate(log.dateFrom, "yyyy-MM") ===
        formatDate(targetMonth, "yyyy-MM")
      );
    });
  };

  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const thisMonthLogs = filterLogsByMonth(data, today);
  const lastMonthLogs = filterLogsByMonth(data, lastMonth);

  return (
    <Tabs aria-label="Entry Exit Logs" variant="underline">
      <Tabs.Item title="This Month" icon={FiZap}>
        <Datatable
          tableHeading="This Month's Logs"
          columns={columns}
          data={thisMonthLogs}
          Button={<NewApplication />}
        />
      </Tabs.Item>
      <Tabs.Item title="Last Month" icon={FiClock}>
        <Datatable
          tableHeading="Previous Month's Logs"
          columns={columns}
          data={lastMonthLogs}
        />
      </Tabs.Item>
      <Tabs.Item title="This Year" icon={FiList}>
        <Datatable
          tableHeading="This Year's Logs"
          columns={columns}
          data={data}
        />
      </Tabs.Item>
    </Tabs>
  );
}
