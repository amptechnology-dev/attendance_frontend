"use client";

import { useState } from "react";
import { Select, Spinner } from "flowbite-react";
import { toast } from "react-toastify";
import Datatable from "../components/DatatableSimple";
import { getColumns } from "./columns";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentYearRange() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => y - i);
}

export default function PreviousMonthPanel({
  initialData,
  initialMonth,
  initialYear,
  officeSalaryStructure,
}) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);

  const columns = getColumns(officeSalaryStructure);

  async function fetchData(m, y) {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/get/previous-month?month=${m}&year=${y}`,
        { credentials: "include" },
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.errors || json?.message || "Failed to fetch salary");
      setData(json.data || []);
    } catch (error) {
      toast.error(error.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(m) {
    setMonth(m);
    fetchData(m, year);
  }

  function handleYearChange(y) {
    setYear(y);
    fetchData(month, y);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Salary — {MONTH_NAMES[month - 1]} {year}
        </h3>

        <div className="flex items-center gap-2">
          {loading && <Spinner size="sm" />}
          <Select
            id="pmMonth"
            sizing="sm"
            value={month}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </Select>
          <Select
            id="pmYear"
            sizing="sm"
            value={year}
            onChange={(e) => handleYearChange(Number(e.target.value))}
          >
            {currentYearRange().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      <Datatable
        tableHeading=""
        columns={columns}
        data={data}
      />
    </div>
  );
}