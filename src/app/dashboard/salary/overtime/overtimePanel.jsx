"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Select,
  Label,
  TextInput,
  Checkbox,
  Modal,
} from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
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

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TriStateCheckbox({ checked, indeterminate, onChange, disabled }) {
  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate && !checked;
      }}
      onChange={onChange}
    />
  );
}

export default function OvertimePanel({ overtimeEnabled }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState([]);
  const [locked, setLocked] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [selected, setSelected] = useState({});
  const [manualSlots, setManualSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);

  // Unfreeze (OTP) flow state
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [unfreezeStep, setUnfreezeStep] = useState("request"); // "request" | "verify"
  const [otpValue, setOtpValue] = useState("");
  const [otpMobile, setOtpMobile] = useState("");
  const [unfreezing, setUnfreezing] = useState(false);

  const allStaff = report.flatMap((dept) => dept.staff);
  const allDateKeys = allStaff.flatMap((s) => s.dates.map((d) => `${s.staffId}::${d.date}`));
  const selectedCount = allDateKeys.filter((k) => selected[k]).length;
  const isAllSelected = allDateKeys.length > 0 && selectedCount === allDateKeys.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/overtime/report?month=${month}&year=${year}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to fetch overtime report");

      const departments = data.data?.departments || [];

      // আগে apply করা date গুলো checked অবস্থায় ও তাদের slot value দিয়ে pre-fill করা হচ্ছে
      const initialSelected = {};
      const initialManualSlots = {};
      departments.forEach((dept) => {
        dept.staff.forEach((s) => {
          s.dates.forEach((d) => {
            const key = `${s.staffId}::${d.date}`;
            if (d.alreadyApplied) {
              initialSelected[key] = true;
              if (d.source === "manual") {
                initialManualSlots[key] = String(d.slots ?? 0);
              }
            }
          });
        });
      });

      setReport(departments);
      setLocked(Boolean(data.data?.locked));
      setSelected(initialSelected);
      setManualSlots(initialManualSlots);
    } catch (error) {
      toast.error(error.message);
      setReport([]);
      setLocked(false);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  }

  function toggleDate(staffId, date, value) {
    setSelected((prev) => ({ ...prev, [`${staffId}::${date}`]: value }));
  }

  function toggleStaffAll(staff, value) {
    setSelected((prev) => {
      const next = { ...prev };
      staff.dates.forEach((d) => (next[`${staff.staffId}::${d.date}`] = value));
      return next;
    });
  }

  function toggleDepartmentAll(dept, value) {
    setSelected((prev) => {
      const next = { ...prev };
      dept.staff.forEach((s) =>
        s.dates.forEach((d) => (next[`${s.staffId}::${d.date}`] = value)),
      );
      return next;
    });
  }

  function toggleGlobalAll(value) {
    setSelected((prev) => {
      const next = { ...prev };
      allDateKeys.forEach((k) => (next[k] = value));
      return next;
    });
  }

  function updateManualSlot(staffId, date, value) {
    if (value !== "" && !/^\d*$/.test(value)) return;
    setManualSlots((prev) => ({ ...prev, [`${staffId}::${date}`]: value }));
  }

  async function handleApply() {
    const selections = allStaff
      .map((s) => ({
        staffId: s.staffId,
        dates: s.dates
          .filter((d) => selected[`${s.staffId}::${d.date}`])
          .map((d) => ({
            date: d.date,
            slots:
              d.source === "manual"
                ? Number(manualSlots[`${s.staffId}::${d.date}`] || 0)
                : d.slots,
            source: d.source,
          })),
      }))
      .filter((s) => s.dates.length > 0);

    if (!selections.length) {
      toast.warning("Please select atleast one date");
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
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to apply overtime");
      toast.success("Overtime applied successfully!");
      fetchReport();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setApplying(false);
    }
  }

  async function confirmFreeze() {
    setFreezing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to freeze salary");
      toast.success("Salary frozen successfully!");
      setShowFreezeModal(false);
      fetchReport();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFreezing(false);
    }
  }

  function openUnfreezeModal() {
    setUnfreezeStep("request");
    setOtpValue("");
    setShowUnfreezeModal(true);
  }

  async function requestUnfreeze() {
    setUnfreezing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/unfreeze/request-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to send OTP");
      setOtpMobile(data.data?.mobile || "");
      setUnfreezeStep("verify");
      toast.success("OTP sent to your registered mobile number.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnfreezing(false);
    }
  }

  async function confirmUnfreeze() {
    if (!otpValue) {
      toast.error("Please enter the OTP.");
      return;
    }
    setUnfreezing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/unfreeze/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year, otp: otpValue }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to verify OTP");
      toast.success("Salary unfrozen successfully!");
      setShowUnfreezeModal(false);
      setUnfreezeStep("request");
      setOtpValue("");
      fetchReport();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnfreezing(false);
    }
  }

  if (!overtimeEnabled) {
    return (
      <Card>
        <p className="text-sm text-gray-500">
          Overtime is not enabled in Salary Structure settings. Please enable it first.
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
            <TextInput
              id="year"
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v)) setYear(v);
              }}
            />
          </div>
          <Button
            onClick={fetchReport}
            isProcessing={loading}
            disabled={loading}
          >
            Load Report
          </Button>

          {hasFetched && !locked && (
            <Button
              color="warning"
              onClick={() => setShowFreezeModal(true)}
            >
              Salary Freeze
            </Button>
          )}

          {hasFetched && locked && (
            <Button color="failure" onClick={openUnfreezeModal}>
              Unfreeze Salary
            </Button>
          )}

          {report.length > 0 && (
            <>
              <label className="flex items-center gap-2 text-sm pb-2">
                <TriStateCheckbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  disabled={locked}
                  onChange={(e) => toggleGlobalAll(e.target.checked)}
                />
                Select all (all departments)
              </label>
              <Button
                color="success"
                onClick={handleApply}
                isProcessing={applying}
                disabled={applying || locked}
              >
                Apply Overtime
              </Button>
            </>
          )}
        </div>

        {locked && (
          <p className="mt-3 text-sm text-amber-600">
            Salary for this month is frozen — no further changes are allowed.
          </p>
        )}
      </Card>

      {hasFetched && report.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500 text-center py-4">
            There is no overtime record present in this month.
          </p>
        </Card>
      )}

      {report.map((dept) => {
        const deptDateKeys = dept.staff.flatMap((s) =>
          s.dates.map((d) => `${s.staffId}::${d.date}`),
        );
        const deptSelectedCount = deptDateKeys.filter((k) => selected[k]).length;
        const deptAllSelected =
          deptDateKeys.length > 0 && deptSelectedCount === deptDateKeys.length;
        const deptSomeSelected = deptSelectedCount > 0 && !deptAllSelected;

        return (
          <Card key={dept.departmentName}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{dept.departmentName}</h4>
              <label className="flex items-center gap-2 text-xs">
                <TriStateCheckbox
                  checked={deptAllSelected}
                  indeterminate={deptSomeSelected}
                  disabled={locked}
                  onChange={(e) => toggleDepartmentAll(dept, e.target.checked)}
                />
                Select all
              </label>
            </div>

            <div className="space-y-3">
              {dept.staff.map((s) => {
                const staffSelectedCount = s.dates.filter(
                  (d) => selected[`${s.staffId}::${d.date}`],
                ).length;
                const staffAllSelected =
                  s.dates.length > 0 && staffSelectedCount === s.dates.length;
                const staffSomeSelected =
                  staffSelectedCount > 0 && !staffAllSelected;

                return (
                  <div key={s.staffId} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-medium">
                        <TriStateCheckbox
                          checked={staffAllSelected}
                          indeterminate={staffSomeSelected}
                          disabled={locked}
                          onChange={(e) => toggleStaffAll(s, e.target.checked)}
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
                      {s.dates.map((d) => {
                        const key = `${s.staffId}::${d.date}`;
                        return (
                          <div
                            key={d.date}
                            className="flex flex-col gap-0.5 rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={!!selected[key]}
                                disabled={locked}
                                onChange={(e) =>
                                  toggleDate(s.staffId, d.date, e.target.checked)
                                }
                              />
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
                              {d.alreadyApplied && (
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                                  Applied
                                </span>
                              )}
                              {d.source === "manual" ? (
                                <TextInput
                                  sizing="sm"
                                  className="w-14"
                                  disabled={locked}
                                  value={manualSlots[key] ?? ""}
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
                                <span className="font-semibold">
                                  {d.slots} slot
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 pl-6">
                              In: {formatTime(d.entryTime)} — Out:{" "}
                              {formatTime(d.exitTime)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Freeze confirmation modal */}
      <Modal
        show={showFreezeModal}
        size="md"
        onClose={() => setShowFreezeModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Freeze salary for {MONTH_NAMES[month - 1]} {year}?
            </h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Once frozen, salary calculation, advance salary changes,
              conveyance edits, and overtime application will be locked for
              this month. You can unfreeze it later with an OTP.
            </p>
            <div className="flex justify-center gap-3">
              <Button color="gray" onClick={() => setShowFreezeModal(false)}>
                Cancel
              </Button>
              <Button
                color="warning"
                onClick={confirmFreeze}
                isProcessing={freezing}
                disabled={freezing}
              >
                Yes, freeze it
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Unfreeze OTP modal */}
      <Modal
        show={showUnfreezeModal}
        size="md"
        onClose={() => setShowUnfreezeModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Unfreeze salary for {MONTH_NAMES[month - 1]} {year}?
            </h3>

            {unfreezeStep === "request" ? (
              <>
                <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  An OTP will be sent to your registered mobile number to
                  confirm this action.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    color="gray"
                    onClick={() => setShowUnfreezeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="failure"
                    onClick={requestUnfreeze}
                    isProcessing={unfreezing}
                    disabled={unfreezing}
                  >
                    Send OTP
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  Enter the OTP sent to {otpMobile || "your registered number"}.
                </p>
                <TextInput
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otpValue}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setOtpValue(e.target.value);
                  }}
                  className="mb-4"
                />
                <div className="flex justify-center gap-3">
                  <Button
                    color="gray"
                    onClick={() => setShowUnfreezeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="failure"
                    onClick={confirmUnfreeze}
                    isProcessing={unfreezing}
                    disabled={unfreezing}
                  >
                    Verify & Unfreeze
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}