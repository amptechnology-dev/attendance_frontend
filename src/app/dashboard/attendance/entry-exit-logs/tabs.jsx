"use client";
import { useState } from "react";
import Datatable from "../../components/DatatableSimple";
import { columns } from "./columns";
import { Tabs } from "flowbite-react";
import { FiZap, FiClock, FiList, FiCalendar, FiFilter } from "react-icons/fi";
import AddButton from "./addEntry";
import FilterModal from "../../components/FilterModal";
import { filterLogsByDateRange } from "@/lib/helpers";

export default function tabs({
  data,
  staffs = [],
  departments = [],
  filterLabel,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const todayLogs = filterLogsByDateRange(data, "today");
  const yesterdayLogs = filterLogsByDateRange(data, "yesterday");
  const thisMonthLogs = filterLogsByDateRange(data, "thisMonth");

  return (
    <>
      <Tabs
        aria-label="Entry Exit Logs"
        variant="underline"
        onActiveTabChange={(index) => {
          if (index === 3) setIsFilterOpen(true);
        }}
      >
        <Tabs.Item title="Today" icon={FiZap}>
          <Datatable
            tableHeading="Today's Logs"
            columns={columns}
            data={todayLogs}
            Button={<AddButton staffs={staffs} departments={departments} />}
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
        <Tabs.Item title="Filtered" icon={FiList}>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
            >
              <FiFilter size={14} />
              Change filter
            </button>
          </div>
          <Datatable tableHeading={filterLabel} columns={columns} data={data} />
        </Tabs.Item>
      </Tabs>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
}
