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

export default function BonusRegisterPanel({ bonusMode }) {
  const now = new Date();
  const [settingMonths, setSettingMonths] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [departments, setDepartments] = useState([]);
  const [locked, setLocked] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amounts, setAmounts] = useState({});
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
      setLocked(Boolean(data.data?.locked));

      const initialAmounts = {};
      (data.data?.departments || []).forEach((dept) => {
        dept.staff.forEach((s) => {
          initialAmounts[s.staffId] = String(s.amount ?? 0);
        });
      });
      setAmounts(initialAmounts);
    } catch (error) {
      toast.error(error.message);
      setDepartments([]);
      setLocked(false);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  }

  function updateAmount(staffId, value) {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setAmounts((prev) => ({ ...prev, [staffId]: value }));
  }

  async function handleSave() {
    const entries = Object.entries(amounts).map(([staffId, amount]) => ({
      staffId,
      amount: Number(amount) || 0,
    }));

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/bonus/manual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year, entries }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save bonus");
      toast.success("Bonus saved successfully!");
      fetchRegister();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

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
      // Revoke a bit later — the new tab needs the URL to still be valid
      // when it loads the PDF, revoking immediately can blank the preview.
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

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          {bonusMode === "auto" ? (
            <div>
              <Label htmlFor="settingMonth" value="Bonus month" />
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
                    {MONTH_NAMES[sm.month - 1]} {sm.year}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="month" value="Month" />
                <Select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
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
                  {currentYearRange().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

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
                onClick={handleDownloadExcel}
                isProcessing={excelLoading}
                disabled={excelLoading}
              >
                Download Excel
              </Button>
            </>
          )}

          {bonusMode === "manual" && hasFetched && departments.length > 0 && (
            <Button
              color="success"
              onClick={handleSave}
              isProcessing={saving}
              disabled={saving || locked}
            >
              Save Bonus
            </Button>
          )}
        </div>

        {locked && (
          <p className="mt-3 text-sm text-amber-600">
            Salary for this month is frozen — bonus changes are not allowed.
          </p>
        )}
      </Card>

      {hasFetched && departments.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500 text-center py-4">
            No bonus records found for this month.
          </p>
        </Card>
      )}

      {departments.map((dept) => (
        <Card key={dept.departmentName}>
          <h4 className="font-semibold mb-2">{dept.departmentName}</h4>
          <div className="space-y-2">
            {dept.staff.map((s) => (
              <div
                key={s.staffId}
                className="flex items-center justify-between rounded bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm"
              >
                <span>{s.staffName}</span>
                {bonusMode === "auto" ? (
                  <div className="text-right">
                    <span className="font-semibold">₹{s.amount}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {s.percentage}% of ₹{s.baseNetSalarySum} (
                      {s.monthsCounted} months)
                    </span>
                  </div>
                ) : (
                  <TextInput
                    sizing="sm"
                    className="w-28"
                    disabled={locked}
                    value={amounts[s.staffId] ?? ""}
                    placeholder="0"
                    onChange={(e) => updateAmount(s.staffId, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}