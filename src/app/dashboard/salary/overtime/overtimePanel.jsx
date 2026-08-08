"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Select,
  Label,
  TextInput,
  Checkbox,
} from "flowbite-react";
import { toast } from "react-toastify";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const months = MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }));
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function OvertimePanel({ overtimeEnabled }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState([]);
  const [selected, setSelected] = useState({}); // { staffId: true/false }
  const [manualSlots, setManualSlots] = useState({}); // { "staffId::date": slots }
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/overtime/report?month=${month}&year=${year}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch overtime report");
      setReport(data.data || []);
      setSelected({});
      setManualSlots({});
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleStaff(staffId, value) {
    setSelected((prev) => ({ ...prev, [staffId]: value }));
  }

  function toggleDepartmentAll(dept, value) {
    setSelected((prev) => {
      const next = { ...prev };
      dept.staff.forEach((s) => (next[s.staffId] = value));
      return next;
    });
  }

  function updateManualSlot(staffId, date, value) {
    if (value !== "" && !/^\d*$/.test(value)) return;
    setManualSlots((prev) => ({ ...prev, [`${staffId}::${date}`]: value }));
  }

  async function handleApply() {
    const selections = report
      .flatMap((dept) => dept.staff)
      .filter((s) => selected[s.staffId])
      .map((s) => ({
        staffId: s.staffId,
        dates: s.dates.map((d) => ({
          date: d.date,
          slots:
            d.source === "manual"
              ? Number(manualSlots[`${s.staffId}::${d.date}`] || 0)
              : d.slots,
          source: d.source,
        })),
      }));

    if (!selections.length) {
      toast.warning("Please select atleast one staff member");
      return;
    }

    setApplying(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/overtime/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year, selections }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to apply overtime");
      toast.success("Overtime applied successfully!");
      fetchReport();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setApplying(false);
    }
  }

  if (!overtimeEnabled) {
    return (
      <Card>
        <p className="text-sm text-gray-500">
          Salary Structure settings-এ Overtime enable করা নেই। আগে সেটা enable
          করো।
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="month" value="Month" />
            <Select
              id="month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="year" value="Year" />
            <Select
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <Button
            onClick={fetchReport}
            isProcessing={loading}
            disabled={loading}
          >
            Load Report
          </Button>
          {report.length > 0 && (
            <Button
              color="success"
              onClick={handleApply}
              isProcessing={applying}
              disabled={applying}
            >
              Apply Overtime
            </Button>
          )}
        </div>
      </Card>

      {report.map((dept) => (
        <Card key={dept.departmentName}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{dept.departmentName}</h4>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                onChange={(e) => toggleDepartmentAll(dept, e.target.checked)}
              />
              Select all
            </label>
          </div>

          <div className="space-y-3">
            {dept.staff.map((s) => (
              <div key={s.staffId} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-medium">
                    <Checkbox
                      checked={!!selected[s.staffId]}
                      onChange={(e) => toggleStaff(s.staffId, e.target.checked)}
                    />
                    {s.staffName}
                    {s.alreadyApplied && (
                      <span className="text-xs text-green-600">
                        (already applied: {s.appliedTotalSlots} slots / ₹
                        {s.appliedAmount})
                      </span>
                    )}
                  </label>
                  <span className="text-xs text-gray-500">
                    Total slots: {s.totalSlots}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {s.dates.map((d) => (
                    <div
                      key={d.date}
                      className="flex flex-col gap-0.5 rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{d.date}</span>
                        {d.dayType && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              d.dayType === "holiday"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                            }`}
                          >
                            {d.dayType === "holiday" ? "Holiday" : "WO"}
                          </span>
                        )}
                        {d.source === "manual" ? (
                          <TextInput
                            sizing="sm"
                            className="w-14"
                            value={manualSlots[`${s.staffId}::${d.date}`] ?? ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateManualSlot(
                                s.staffId,
                                d.date,
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          <span className="font-semibold">{d.slots} slot</span>
                        )}
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">
                        In: {formatTime(d.entryTime)} — Out:{" "}
                        {formatTime(d.exitTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
