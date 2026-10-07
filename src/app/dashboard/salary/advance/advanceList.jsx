"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Label, TextInput, Badge, Card } from "flowbite-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import AddAdvance from "./add";
import EditButton from "./edit";
import PaidButton from "./paid";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URI;

const EMPTY_FILTERS = { department: "", staff: "", startMonth: "", endMonth: "", status: "" };

const TH =
  "border border-gray-300 px-2 py-1.5 bg-slate-200 text-[11px] font-semibold text-center whitespace-nowrap";
const TD = "border border-gray-300 px-2 py-1.5 text-center align-middle";
const statusColor = { Active: "success", Paused: "warning", Closed: "gray" };

const fmtDate = (d) => (d ? format(new Date(d), "dd/MM/yyyy") : "-");
const money = (n) => Number(n || 0).toLocaleString("en-IN");

function buildQuery(filters) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  return p.toString();
}

export default function AdvanceList({
  activeAdvances = [],
  staffs = [],
  departments = [],
  staffsWithNoAdvance = [],
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState("");

  // staffId -> staff doc (advanceSalary shoho). Edit/Paid button er jonno lagbe
  const activeMap = useMemo(
    () => new Map(activeAdvances.map((s) => [String(s._id), s])),
    [activeAdvances],
  );

  const fetchReport = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/admin/report/advance?${buildQuery(f)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch advances");
      setData(json.data || []);
      setApplied(f);
    } catch (error) {
      toast.error(error.message, { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Mount e + Add/Edit/Paid er por router.refresh() hole (activeAdvances change hoy) notun kore fetch
  useEffect(() => {
    fetchReport(applied);
  }, [activeAdvances]); // eslint-disable-line react-hooks/exhaustive-deps

  const staffOptions = staffs.filter(
    (s) => !filters.department || s.department?._id === filters.department,
  );

  const setField = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (filters.startMonth && filters.endMonth && filters.startMonth > filters.endMonth) {
      toast.error("'From Month' 'To Month' er por hote parbe na.", { position: "bottom-right" });
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
      const res = await fetch(`${BACKEND}/admin/report/advance/${kind}?${buildQuery(applied)}`, {
        credentials: "include",
      });
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Advance Salary
          </h5>
          <AddAdvance staffs={staffsWithNoAdvance} departments={departments} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-3 md:grid-cols-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="adv_department" value="Department" />
              </div>
              <Select
                id="adv_department"
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, department: e.target.value, staff: "" }))
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
                <Label htmlFor="adv_staff" value="Staff" />
              </div>
              <Select
                id="adv_staff"
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
                <Label htmlFor="adv_start" value="From Month" />
              </div>
              <TextInput
                id="adv_start"
                type="month"
                value={filters.startMonth}
                onChange={(e) => setField("startMonth", e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="adv_end" value="To Month" />
              </div>
              <TextInput
                id="adv_end"
                type="month"
                value={filters.endMonth}
                onChange={(e) => setField("endMonth", e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="adv_status" value="Status" />
              </div>
              <Select
                id="adv_status"
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
              Search
            </Button>
            <Button type="button" color="failure" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <div className="p-3">
        <div className="flex flex-wrap gap-2 items-center py-3">
          <h3 className="text-lg">Advances</h3>
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

        {!data.length ? (
          <p className="text-sm text-gray-500">{loading ? "Loading..." : "No advance records found."}</p>
        ) : (
          <div className="space-y-6">
            {data.map((dept) => (
              <div key={dept._id}>
                <div className="mb-2 flex items-center justify-between border-b-2 border-blue-600 pb-1">
                  <h2 className="text-base font-bold text-gray-900">Advance Salary</h2>
                  <span className="text-sm font-semibold text-blue-700">
                    {dept.departmentName} &middot; {period}
                  </span>
                </div>

                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="border-collapse text-xs w-full">
                    <thead>
                      <tr>
                        <th className={TH}>Sl</th>
                        <th className={TH}>Adv No</th>
                        <th className={TH}>Date of Advance</th>
                        <th className={TH}>Staff</th>
                        <th className={TH}>Advance Amount</th>
                        <th className={TH}>Total Repayment Made</th>
                        <th className={TH}>Last Payment Date</th>
                        <th className={TH}>Pending Amount</th>
                        <th className={TH}>Remaining Months</th>
                        <th className={TH}>Status</th>
                        <th className={TH}>#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dept.advances.map((a, i) => {
                        const staffDoc = a.status !== "Closed" ? activeMap.get(String(a.staff)) : null;
                        return (
                          <tr
                            key={a._id}
                            className={`cursor-pointer hover:bg-blue-50 ${
                              i % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                            title="Click to view advance details"
                            onClick={() =>
                              router.push(`/dashboard/reports/advance/${a._id}?from=salary`)
                            }
                          >
                            <td className={TD}>{i + 1}</td>
                            <td className={`${TD} font-semibold text-blue-700`}>{a.advanceNo}</td>
                            <td className={TD}>{fmtDate(a.dateOfAdvance)}</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-left align-middle">
                              <div className="font-medium leading-tight">{a.staffName}</div>
                              <p className="text-[10px] text-gray-500">{a.staffId || "-"}</p>
                            </td>
                            <td className={TD}>{money(a.advanceAmount)}</td>
                            <td className={TD}>{money(a.totalRepaid)}</td>
                            <td className={TD}>{fmtDate(a.lastPaymentDate)}</td>
                            <td className={`${TD} font-semibold`}>{money(a.pendingAmount)}</td>
                            <td className={TD}>{a.remainingMonths}</td>
                            <td className={TD}>
                              <div className="flex justify-center">
                                <Badge color={statusColor[a.status] || "gray"}>{a.status}</Badge>
                              </div>
                            </td>
                            {/* Action cell e click korle row navigate hobe na */}
                            <td className={TD} onClick={(e) => e.stopPropagation()}>
                              {staffDoc ? (
                                <div className="flex justify-center gap-2">
                                  <EditButton staff={staffDoc} />
                                  <PaidButton staffId={staffDoc._id} />
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-blue-50 font-bold">
                        <td className={`${TD} text-right`} colSpan={4}>
                          Total:
                        </td>
                        <td className={TD}>{money(dept.totals.advanceAmount)}</td>
                        <td className={TD}>{money(dept.totals.totalRepaid)}</td>
                        <td className={TD}></td>
                        <td className={TD}>{money(dept.totals.pendingAmount)}</td>
                        <td className={TD}></td>
                        <td className={TD}></td>
                        <td className={TD}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}