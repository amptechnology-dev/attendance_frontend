"use client";

import { Card, Button, Select, Label, TextInput } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ShowTable from "./table";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URI;

const EMPTY_FILTERS = {
  department: "",
  staff: "",
  startMonth: "",
  endMonth: "",
  status: "",
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  return p.toString();
}

export default function AdvanceReportClient() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS); // jei filter diye report generate hoyeche (export eta-i use korbe)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState("");
  const [departments, setDepartments] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const fetchReport = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/admin/report/advance?${buildQuery(f)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch advance report");
      setData(json.data || []);
      setApplied(f);
    } catch (error) {
      toast.error(error.message, { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Mount e: dropdown data + default report (sob advance)
  useEffect(() => {
    async function loadOptions() {
      try {
        const [deptRes, staffRes] = await Promise.all([
          fetch(`${BACKEND}/admin/department/get`, { credentials: "include" }),
          fetch(`${BACKEND}/admin/staff/get`, { credentials: "include" }),
        ]);
        if (deptRes.ok) setDepartments((await deptRes.json()).data || []);
        if (staffRes.ok) setStaffs((await staffRes.json()).data || []);
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    }
    loadOptions();
    fetchReport(EMPTY_FILTERS);
  }, [fetchReport]);

  const staffOptions = staffs.filter(
    (s) => !filters.department || s.department?._id === filters.department,
  );

  function setField(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (filters.startMonth && filters.endMonth && filters.startMonth > filters.endMonth) {
      toast.error("'From Month' 'To Month' er por hote parbe na.", {
        position: "bottom-right",
      });
      return;
    }
    fetchReport(filters);
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS);
    fetchReport(EMPTY_FILTERS);
  }

  async function handleExport(kind) {
    setExporting(kind);
    try {
      const res = await fetch(
        `${BACKEND}/admin/report/advance/${kind}?${buildQuery(applied)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        let msg = "Export failed";
        try {
          const j = await res.json();
          msg = j.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (kind === "pdf") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "advance-report.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (error) {
      toast.error(error.message, { position: "bottom-right" });
    } finally {
      setExporting("");
    }
  }

  const period =
    applied.startMonth || applied.endMonth
      ? `${applied.startMonth || "Start"} to ${applied.endMonth || "Now"}`
      : "All Time";

  return (
    <>
      <Card>
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Generate Advance Report
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-3 md:grid-cols-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="department" value="Department" />
              </div>
              <Select
                id="department"
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: e.target.value,
                    staff: "",
                  }))
                }
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="staff" value="Staff" />
              </div>
              <Select
                id="staff"
                value={filters.staff}
                onChange={(e) => setField("staff", e.target.value)}
              >
                <option value="">All Staff</option>
                {staffOptions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.staffId} - {s.fullName}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="startMonth" value="From Month" />
              </div>
              <TextInput
                id="startMonth"
                type="month"
                value={filters.startMonth}
                onChange={(e) => setField("startMonth", e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="endMonth" value="To Month" />
              </div>
              <TextInput
                id="endMonth"
                type="month"
                value={filters.endMonth}
                onChange={(e) => setField("endMonth", e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="status" value="Status" />
              </div>
              <Select
                id="status"
                value={filters.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="">All</option>
                <option value="active">Active (incl. Paused)</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" isProcessing={loading} disabled={loading}>
              Generate
            </Button>
            <Button type="button" color="failure" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <div className="p-3">
        <div className="flex flex-wrap gap-2 items-center py-3">
          <h3 className="text-lg">Genarated Report</h3>
          {data.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="xs"
                color="failure"
                onClick={() => handleExport("pdf")}
                isProcessing={exporting === "pdf"}
                disabled={!!exporting}
              >
                Export PDF
              </Button>
              <Button
                size="xs"
                color="success"
                onClick={() => handleExport("excel")}
                isProcessing={exporting === "excel"}
                disabled={!!exporting}
              >
                Export Excel
              </Button>
            </div>
          )}
        </div>
        <ShowTable data={data} period={period} loading={loading} />
      </div>
    </>
  );
}