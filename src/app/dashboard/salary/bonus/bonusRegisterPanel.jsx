"use client";

import { useEffect, useState } from "react";
import { Card, Button, Select, Label, TextInput } from "flowbite-react";
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

function currentYearRange() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => y - i);
}

function computeBackMonths(fromMonth, fromYear, toMonth, toYear) {
  return toYear * 12 + toMonth - (fromYear * 12 + fromMonth) + 1;
}

export default function BonusRegisterPanel({ bonusMode }) {
  const now = new Date();

  // ---------- Shared: month/year the register / PDF / Excel operate on ----------
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // ---------- Auto mode ----------
  const [settingMonths, setSettingMonths] = useState([]);
  const [label, setLabel] = useState("");
  const [departments, setDepartments] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------- Manual mode: unified filter + staff + amounts ----------
  const [fromMonth, setFromMonth] = useState(now.getMonth() + 1);
  const [fromYear, setFromYear] = useState(now.getFullYear());
  const [toMonth, setToMonth] = useState(now.getMonth() + 1);
  const [toYear, setToYear] = useState(now.getFullYear());
  const [minTenureMonths, setMinTenureMonths] = useState("0");
  const [genLabel, setGenLabel] = useState("");
  const [genDepartments, setGenDepartments] = useState([]);
  const [genAmounts, setGenAmounts] = useState({});
  const [genLoading, setGenLoading] = useState(false);
  const [genSaving, setGenSaving] = useState(false);
  const [genFetched, setGenFetched] = useState(false);
  // Tracks whether the currently-loaded staff/amounts have actually been saved to the DB.
  // PDF/Excel export reads from the DB, so exporting is only allowed after a successful save,
  // and any edit after that invalidates it again until the next save.
  const [genSaved, setGenSaved] = useState(false);
  const [bulkAmount, setBulkAmount] = useState(""); // applies to ALL departments
  const [deptBulkAmounts, setDeptBulkAmounts] = useState({}); // per-department bulk amount, keyed by departmentName

  // ---------- Export ----------
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  useEffect(() => {
    if (bonusMode !== "auto") return;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/settings-months`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data?.message || "Failed to load bonus setting months",
          );
        setSettingMonths(data.data || []);
        if (data.data?.length) {
          setMonth(data.data[0].month);
          setYear(data.data[0].year);
        }
      } catch (error) {
        toast.error(error.message);
      }
    })();
  }, [bonusMode]);

  // ================= AUTO MODE =================

  async function fetchRegister() {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/register?month=${month}&year=${year}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to fetch bonus register");

      setDepartments(data.data?.departments || []);
      setGrandTotal(data.data?.grandTotal || 0);
      setLabel(data.data?.label || "");
      setLocked(Boolean(data.data?.locked));
    } catch (error) {
      toast.error(error.message);
      setDepartments([]);
      setGrandTotal(0);
      setLabel("");
      setLocked(false);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  }

  // ================= MANUAL MODE =================

  async function handleLoadStaff() {
    const backMonths = computeBackMonths(
      Number(fromMonth),
      Number(fromYear),
      Number(toMonth),
      Number(toYear),
    );
    if (backMonths < 1) {
      toast.error("'From' date must be before or equal to 'To' date.");
      return;
    }

    setGenLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/manual/staff-list?month=${toMonth}&year=${toYear}&backMonths=${backMonths}&minTenureMonths=${minTenureMonths || 0}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to load eligible staff");

      const loadedDepartments = data.data?.departments || [];
      setGenDepartments(loadedDepartments);
      setGenLabel(data.data?.label || "");

      const initialAmounts = {};
      loadedDepartments.forEach((dept) => {
        dept.staff.forEach((s) => {
          initialAmounts[s.staffId] = String(s.amount ?? 0);
        });
      });
      setGenAmounts(initialAmounts);
      setBulkAmount("");
      setDeptBulkAmounts({});

      // If every staff already has a previously-saved amount (i.e. this exact range was
      // saved before and nothing has changed yet), allow export immediately. Otherwise
      // export stays locked until the admin saves again.
      const alreadySaved =
        loadedDepartments.length > 0 &&
        loadedDepartments.every((dept) =>
          dept.staff.every((s) => (s.amount ?? 0) > 0),
        );
      setGenSaved(alreadySaved);
    } catch (error) {
      toast.error(error.message);
      setGenDepartments([]);
      setGenLabel("");
      setGenSaved(false);
    } finally {
      setGenFetched(true);
      setGenLoading(false);
    }
  }

  function updateGenAmount(staffId, value) {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setGenAmounts((prev) => ({ ...prev, [staffId]: value }));
    setGenSaved(false);
  }

  // Global bulk apply — every staff across every department
  function applyBulkAmount() {
    if (bulkAmount === "" || isNaN(Number(bulkAmount))) {
      toast.warning("Enter a valid amount first.");
      return;
    }
    const next = {};
    genDepartments.forEach((dept) => {
      dept.staff.forEach((s) => {
        next[s.staffId] = bulkAmount;
      });
    });
    setGenAmounts(next);
    setGenSaved(false);
    toast.success("Amount applied to all staff. Review and click Save Bonus.");
  }

  // Per-department bulk input change
  function updateDeptBulkAmount(deptName, value) {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setDeptBulkAmounts((prev) => ({ ...prev, [deptName]: value }));
  }

  // Per-department bulk apply — only staff belonging to this department
  function applyDeptBulkAmount(dept) {
    const value = deptBulkAmounts[dept.departmentName];
    if (value === undefined || value === "" || isNaN(Number(value))) {
      toast.warning("Enter a valid amount first.");
      return;
    }
    setGenAmounts((prev) => {
      const next = { ...prev };
      dept.staff.forEach((s) => {
        next[s.staffId] = value;
      });
      return next;
    });
    setGenSaved(false);
    toast.success(
      `Amount applied to all staff in ${dept.departmentName}. Review and click Save Bonus.`,
    );
  }

  async function handleSaveGenerated() {
    const backMonths = computeBackMonths(
      Number(fromMonth),
      Number(fromYear),
      Number(toMonth),
      Number(toYear),
    );
    const entries = Object.entries(genAmounts).map(([staffId, amount]) => ({
      staffId,
      amount: Number(amount) || 0,
    }));

    if (!entries.length) {
      toast.warning("No staff loaded to save.");
      return;
    }

    setGenSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/manual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            month: toMonth,
            year: toYear,
            backMonths,
            minTenureMonths: Number(minTenureMonths) || 0,
            entries,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save bonus");
      toast.success("Bonus saved successfully!");

      // Register/export always operates on the "To" month-year for manual mode
      setMonth(toMonth);
      setYear(toYear);
      setGenSaved(true);
    } catch (error) {
      toast.error(error.message);
      setGenSaved(false);
    } finally {
      setGenSaving(false);
    }
  }

  // ================= EXPORT (shared by both modes) =================

  async function handlePreviewPdf() {
    setPdfLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/register/pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handlePreviewPdfWithoutSignature() {
    setPdfLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/register/pdf-without-signature`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDownloadExcel() {
    setExcelLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/register/excel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to generate Excel");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bonus_register_${month}_${year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setExcelLoading(false);
    }
  }

  // ================= AUTO MODE UI =================

  if (bonusMode === "auto") {
    return (
      <div className="space-y-4">
        <Card>
          <h4 className="font-semibold mb-3">Bonus Register</h4>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="settingMonth" value="Bonus period" />
              <Select
                id="settingMonth"
                value={`${month}-${year}`}
                onChange={(e) => {
                  const [m, y] = e.target.value.split("-").map(Number);
                  setMonth(m);
                  setYear(y);
                }}
              >
                {settingMonths.length === 0 && (
                  <option value="">No bonus rule configured</option>
                )}
                {settingMonths.map((sm) => (
                  <option
                    key={`${sm.month}-${sm.year}`}
                    value={`${sm.month}-${sm.year}`}
                  >
                    {sm.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              onClick={fetchRegister}
              isProcessing={loading}
              disabled={loading}
            >
              Load Register
            </Button>

            {hasFetched && departments.length > 0 && (
              <>
                <Button
                  color="gray"
                  onClick={handlePreviewPdf}
                  isProcessing={pdfLoading}
                  disabled={pdfLoading}
                >
                  View PDF
                </Button>
                <Button
                  color="gray"
                  onClick={handlePreviewPdfWithoutSignature}
                  isProcessing={pdfLoading}
                  disabled={pdfLoading}
                >
                  Bonus Register PDF
                </Button>
                <Button
                  color="gray"
                  onClick={handleDownloadExcel}
                  isProcessing={excelLoading}
                  disabled={excelLoading}
                >
                  Download Excel
                </Button>
              </>
            )}
          </div>

          {label && (
            <p className="mt-3 text-sm text-gray-500">Period: {label}</p>
          )}
          {locked && (
            <p className="mt-2 text-sm text-amber-600">
              Salary for this month is frozen — bonus changes are not allowed.
            </p>
          )}
        </Card>

        {hasFetched && departments.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500 text-center py-4">
              No bonus records found for this period.
            </p>
          </Card>
        )}

        {departments.map((dept) => (
          <Card key={dept.departmentName}>
            <h4 className="font-semibold mb-2">{dept.departmentName}</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span className="col-span-1">SL</span>
                <span className="col-span-3">Staff ID</span>
                <span className="col-span-5">Name</span>
                <span className="col-span-3 text-right">Amount</span>
              </div>
              {dept.staff.map((s, i) => (
                <div
                  key={s.staffId}
                  className="grid grid-cols-12 gap-2 items-center rounded bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  <span className="col-span-1">{i + 1}</span>
                  <span className="col-span-3">{s.staffCode}</span>
                  <span className="col-span-5">{s.staffName}</span>
                  <span className="col-span-3 text-right font-semibold">
                    ₹{s.amount}
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-2 items-center rounded bg-gray-200 dark:bg-gray-600 px-3 py-2 text-sm font-semibold">
                <span className="col-span-9 text-right">Department Total</span>
                <span className="col-span-3 text-right">
                  ₹{dept.departmentTotal}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {hasFetched && departments.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                color="gray"
                onClick={handlePreviewPdf}
                isProcessing={pdfLoading}
                disabled={pdfLoading}
              >
                <i className="pi pi-file-pdf mr-2 text-red-500" />
                View PDF (With Signature)
              </Button>
              <Button
                color="gray"
                onClick={handlePreviewPdfWithoutSignature}
                isProcessing={pdfLoading}
                disabled={pdfLoading}
              >
                <i className="pi pi-file-pdf mr-2 text-orange-400" />
                View PDF (Without Signature)
              </Button>
              <Button
                color="gray"
                onClick={handleDownloadExcel}
                isProcessing={excelLoading}
                disabled={excelLoading}
              >
                <i className="pi pi-file-excel mr-2 text-green-600" />
                Download Excel
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ================= MANUAL MODE UI (single unified section) =================

  const genGrandTotal = genDepartments.reduce(
    (sum, dept) =>
      sum +
      dept.staff.reduce(
        (s, staff) => s + (Number(genAmounts[staff.staffId]) || 0),
        0,
      ),
    0,
  );

  return (
    <div className="space-y-4">
      <Card>
        <h4 className="font-semibold mb-3">Bonus Register</h4>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label value="From" />
            <div className="flex gap-2">
              <Select
                value={fromMonth}
                onChange={(e) => setFromMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </Select>
              <Select
                value={fromYear}
                onChange={(e) => setFromYear(Number(e.target.value))}
              >
                {currentYearRange().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label value="To" />
            <div className="flex gap-2">
              <Select
                value={toMonth}
                onChange={(e) => setToMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </Select>
              <Select
                value={toYear}
                onChange={(e) => setToYear(Number(e.target.value))}
              >
                {currentYearRange().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="minTenure" value="Min tenure (months)" />
            <TextInput
              id="minTenure"
              type="text"
              inputMode="numeric"
              className="w-32"
              value={minTenureMonths}
              onChange={(e) => {
                if (e.target.value === "" || /^\d*$/.test(e.target.value))
                  setMinTenureMonths(e.target.value);
              }}
            />
          </div>

          <Button
            onClick={handleLoadStaff}
            isProcessing={genLoading}
            disabled={genLoading}
          >
            Load Eligible Staff
          </Button>
        </div>

        {genFetched && genDepartments.length === 0 && !genLoading && (
          <p className="mt-3 text-sm text-gray-500 text-center py-4">
            No eligible staff found for this date range and tenure.
          </p>
        )}

        {!genFetched && (
          <p className="mt-3 text-sm text-gray-500">
            Select a date range and click &quot;Load Eligible Staff&quot; to
            begin.
          </p>
        )}

        {genDepartments.length > 0 && (
          <>
            <p className="mt-3 text-sm text-gray-500">Period: {genLabel}</p>

            <div className="mt-3 flex flex-wrap items-end gap-3 rounded-md border border-dashed border-gray-300 dark:border-gray-600 p-3">
              <div>
                <Label
                  htmlFor="bulkAmount"
                  value="Set same amount for all staff (all departments)"
                />
                <TextInput
                  id="bulkAmount"
                  type="text"
                  inputMode="decimal"
                  className="w-40"
                  placeholder="e.g. 2000"
                  value={bulkAmount}
                  onChange={(e) => {
                    if (
                      e.target.value === "" ||
                      /^\d*\.?\d*$/.test(e.target.value)
                    )
                      setBulkAmount(e.target.value);
                  }}
                />
              </div>
              <Button color="light" onClick={applyBulkAmount}>
                Apply to All
              </Button>
            </div>
          </>
        )}
      </Card>

      {genDepartments.map((dept) => (
        <Card key={dept.departmentName}>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
            <h4 className="font-semibold">{dept.departmentName}</h4>

            <div className="flex items-end gap-2">
              <div>
                <Label
                  htmlFor={`deptBulk-${dept.departmentName}`}
                  value="Same amount for this dept"
                  className="text-xs"
                />
                <TextInput
                  id={`deptBulk-${dept.departmentName}`}
                  sizing="sm"
                  type="text"
                  inputMode="decimal"
                  className="w-28"
                  placeholder="e.g. 2000"
                  value={deptBulkAmounts[dept.departmentName] ?? ""}
                  onChange={(e) =>
                    updateDeptBulkAmount(dept.departmentName, e.target.value)
                  }
                />
              </div>
              <Button
                size="sm"
                color="light"
                onClick={() => applyDeptBulkAmount(dept)}
              >
                Apply to Dept
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {dept.staff.map((s) => (
              <div
                key={s.staffId}
                className="flex items-center justify-between rounded bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm"
              >
                <span>
                  {s.staffName}{" "}
                  <span className="text-xs text-gray-500">({s.staffCode})</span>
                </span>
                <TextInput
                  sizing="sm"
                  className="w-28"
                  value={genAmounts[s.staffId] ?? ""}
                  placeholder="0"
                  onChange={(e) => updateGenAmount(s.staffId, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      {genDepartments.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between text-base font-bold">
            <span>Grand Total</span>
            <span>₹{genGrandTotal}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              color="success"
              onClick={handleSaveGenerated}
              isProcessing={genSaving}
              disabled={genSaving}
            >
              Save Bonus
            </Button>
          </div>

          {genSaved && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                color="gray"
                onClick={handlePreviewPdf}
                isProcessing={pdfLoading}
                disabled={pdfLoading}
              >
                <i className="pi pi-file-pdf mr-2 text-red-500" />
                View PDF (With Signature)
              </Button>
              <Button
                color="gray"
                onClick={handlePreviewPdfWithoutSignature}
                isProcessing={pdfLoading}
                disabled={pdfLoading}
              >
                <i className="pi pi-file-pdf mr-2 text-orange-400" />
                View PDF (Without Signature)
              </Button>
              <Button
                color="gray"
                onClick={handleDownloadExcel}
                isProcessing={excelLoading}
                disabled={excelLoading}
              >
                <i className="pi pi-file-excel mr-2 text-green-600" />
                Download Excel
              </Button>
            </div>
          )}

          {!genSaved && (
            <p className="mt-2 text-xs text-gray-500">
              Save the bonus first — PDF/Excel export will unlock after saving.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}