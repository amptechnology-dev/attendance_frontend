"use client";

import { useState } from "react";
import { Select, Spinner } from "flowbite-react";
import { toast } from "react-toastify";
import Datatable from "../components/DatatableSimple";
import { getColumns } from "./columns";
import OvertimePanel from "./overtime/overtimePanel";
import { FiClock, FiList } from "react-icons/fi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentYearRange() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => y - i);
}

export default function TabsWithDatatable({
  allSalaryData,
  previousMonthSalary,
  previousMonthInitial,
  officeSalaryStructure,
  overtimeParams,
  onExitOvertime,
}) {
  const [activeTab, setActiveTab] = useState("previous");
  const columns = getColumns(officeSalaryStructure);
  const showOvertime = !!overtimeParams;

  const [pmMonth, setPmMonth] = useState(previousMonthInitial.month);
  const [pmYear, setPmYear] = useState(previousMonthInitial.year);
  const [pmData, setPmData] = useState(previousMonthSalary || []);
  const [pmLoading, setPmLoading] = useState(false);

  async function fetchPreviousMonthSalary(m, y) {
    setPmLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/get/previous-month?month=${m}&year=${y}`,
        { credentials: "include" },
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.errors || json?.message || "Failed to fetch salary");
      setPmData(json.data || []);
    } catch (error) {
      toast.error(error.message);
      setPmData([]);
    } finally {
      setPmLoading(false);
    }
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (showOvertime) onExitOvertime();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabClick("previous")}
          className={`-mb-px flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition ${
            activeTab === "previous" && !showOvertime
              ? "border-cyan-600 text-cyan-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiClock className="h-4 w-4" />
          Previous Month
        </button>
        <button
          onClick={() => handleTabClick("last3")}
          className={`-mb-px flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition ${
            activeTab === "last3" && !showOvertime
              ? "border-cyan-600 text-cyan-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiList className="h-4 w-4" />
          Last 3 Months
        </button>

        {!showOvertime && (
          <div className="mb-2 flex items-center gap-2">
            {pmLoading && <Spinner size="sm" />}
            <Select
              sizing="sm"
              value={pmMonth}
              onChange={(e) => {
                const m = Number(e.target.value);
                setPmMonth(m);
                fetchPreviousMonthSalary(m, pmYear);
              }}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </Select>
            <Select
              sizing="sm"
              value={pmYear}
              onChange={(e) => {
                const y = Number(e.target.value);
                setPmYear(y);
                fetchPreviousMonthSalary(pmMonth, y);
              }}
            >
              {currentYearRange().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {showOvertime ? (
        <OvertimePanel
          overtimeEnabled={officeSalaryStructure?.overtime?.enabled}
          initialMonth={overtimeParams.month}
          initialYear={overtimeParams.year}
          onBack={onExitOvertime}
        />
      ) : activeTab === "previous" ? (
        <Datatable
          tableHeading={`Salary — ${MONTH_NAMES[pmMonth - 1]} ${pmYear}`}
          columns={columns}
          data={pmData}
        />
      ) : (
        <Datatable
          tableHeading="Last 3 Months' Salary"
          columns={columns}
          data={allSalaryData}
        />
      )}
    </div>
  );
}