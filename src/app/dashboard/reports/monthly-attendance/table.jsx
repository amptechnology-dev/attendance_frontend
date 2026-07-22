"use client";
import { useRef, useState } from "react";
import { format } from "date-fns";
import { Modal, Button, Badge, Select } from "flowbite-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ADJUSTMENT_OPTIONS = {
  present: [
    { value: "Present to Half-day", label: "Present to Half-day" },
    { value: "Present to Full-day", label: "Present to Full-day" },
    { value: "Hourly", label: "Hourly" },
  ],
  "half-day": [{ value: "Half-day to Full-day", label: "Half-day to Full-day" }],
  absent: [
    { value: "Absent to Half-day", label: "Absent to Half-day" },
    { value: "Absent to Full-day", label: "Absent to Full-day" },
  ],
};

const ADJUSTABLE_TYPES = ["present", "half-day"];

export default function AttendanceTable({ data = [], days = [], month = "" }) {
  const reportRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const [statusModal, setStatusModal] = useState(null);
  const [rowSelections, setRowSelections] = useState(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentModalAdjustable =
    statusModal && ADJUSTABLE_TYPES.includes(statusModal.type);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = reportRef.current;

      const opt = {
        margin: 0.3,
        filename: "attendance-report.pdf",
        html2canvas: {
          scale: 3,
          useCORS: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        },
        jsPDF: { unit: "in", format: "legal", orientation: "landscape" },
        // Single page-break mechanism only: use the `before` selector for
        // every dept-block EXCEPT the first one (via .dept-block-break),
        // and only avoid breaking in the middle of a `tr` row. Avoiding
        // the whole `.dept-block` (as before) forced the entire block to
        // jump to the next page even if only a sliver overflowed the
        // current one — that's what left page 1 (and the page between
        // departments) blank. Also drop "legacy" mode since combining it
        // with a manual inline pageBreakBefore double-triggered breaks.
        pagebreak: {
          mode: ["css"],
          before: ".dept-block-break",
          avoid: ["tr"],
        },
      };

      const blob = await html2pdf().set(opt).from(element).output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF generate korte problem hoyeche.", { position: "bottom-right" });
    } finally {
      setIsGenerating(false);
    }
  };

  const openStatusModal = (staff, type) => {
    let records = [];
    let typeLabel = "";

    if (type === "present") {
      records = staff.attendances.filter((att) => att.status === "present");
      typeLabel = "Present (P)";
    } else if (type === "absent") {
      records = staff.attendances.filter((att) => att.status === "absent");
      typeLabel = "Absent (A)";
    } else if (type === "half-day") {
      records = staff.attendances.filter((att) => att.status === "half-day");
      typeLabel = "Half Day (HD)";
    } else if (type === "full-day") {
      records = staff.attendances.filter((att) => att.status === "full-day");
      typeLabel = "Full Day (FD)";
    } else if (type === "ha") {
      records = staff.attendances.filter(
        (att) => att.hrAdjustment && att.hrAdjustment !== "None",
      );
      typeLabel = "HR Adjustment (HA)";
    }

    if (records.length === 0) {
      toast.info(
        `No "${typeLabel}" records found for ${staff.staffName} this month.`,
        { position: "bottom-right" },
      );
      return;
    }

    records = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    const initialSelections = new Map();
    records.forEach((rec) => {
      initialSelections.set(rec._id, {
        selected: false,
        adjustment:
          rec.hrAdjustment && rec.hrAdjustment !== "None"
            ? rec.hrAdjustment
            : "None",
      });
    });

    setRowSelections(initialSelections);
    setStatusModal({ staffName: staff.staffName, type, typeLabel, records });
  };

  const closeStatusModal = () => {
    setStatusModal(null);
    setRowSelections(new Map());
  };

  const toggleRowSelected = (recordId) => {
    setRowSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(recordId);
      next.set(recordId, { ...current, selected: !current.selected });
      return next;
    });
  };

  const setRowAdjustment = (recordId, value) => {
    setRowSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(recordId);
      next.set(recordId, {
        ...current,
        adjustment: value,
        selected: value !== "None",
      });
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = Array.from(rowSelections.values()).every(
      (v) => v.selected,
    );
    setRowSelections((prev) => {
      const next = new Map(prev);
      next.forEach((val, key) => {
        next.set(key, { ...val, selected: !allSelected });
      });
      return next;
    });
  };

  const handleStatusModalSubmit = async () => {
    const rowsToSubmit = Array.from(rowSelections.entries()).filter(
      ([, val]) => val.selected,
    );

    if (rowsToSubmit.length === 0) {
      toast.error("Please select at least one date to adjust.", {
        position: "bottom-right",
      });
      return;
    }

    const invalidRow = rowsToSubmit.find(
      ([, val]) => !val.adjustment || val.adjustment === "None",
    );
    if (invalidRow) {
      toast.error(
        "Please choose a 'Change To' value for every selected date.",
        { position: "bottom-right" },
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const results = await Promise.all(
        rowsToSubmit.map(async ([recordId, val]) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/hr-adjustment/${recordId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adjustments: val.adjustment }),
              credentials: "include",
            },
          );
          const result = await response.json();
          return {
            ok: response.ok,
            recordId,
            message: result.message,
            errors: result.errors,
          };
        }),
      );

      const failed = results.filter((r) => !r.ok);
      const succeeded = results.length - failed.length;

      if (succeeded > 0) {
        toast.success(`${succeeded} record(s) adjusted successfully!`, {
          position: "bottom-right",
        });
      }
      failed.forEach((f) => {
        toast.error(
          f.errors?.[0]?.message || f.message || "Failed to adjust a record.",
          { position: "bottom-right" },
        );
      });

      closeStatusModal();
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = Array.from(rowSelections.values()).filter(
    (v) => v.selected,
  ).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            "Download PDF"
          )}
        </button>
      </div>

      <div ref={reportRef}>
        <div className="space-y-6">
          {/* Legend now stays glued to the first department's block, not
              floating alone as its own page-1 content. */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
            <span><strong className="text-gray-900">FD</strong> : Full Day</span>
            <span><strong className="text-gray-900">HD</strong> : Half Day</span>
            <span><strong className="text-gray-900">P</strong> : Only Present</span>
            <span><strong className="text-gray-900">A</strong> : Absent</span>
            <span><strong className="text-gray-900">WO</strong> : Week Off</span>
            <span><strong className="text-gray-900">H</strong> : Holiday</span>
            <span><strong className="text-gray-900">HA</strong> : HR Adjustment</span>
          </div>

          {data?.map((dept, deptIdx) => (
            <div
              key={dept._id}
              // Only departments AFTER the first one get a forced page
              // break, and it's driven purely by this CSS class (matched
              // by pagebreak.before in html2pdf options) — no inline
              // style, no duplicate break mechanism, no blank pages.
              className={`dept-block ${deptIdx > 0 ? "dept-block-break" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between border-b-2 border-blue-600 pb-1">
                <h2 className="text-base font-bold text-gray-900">
                  Attendance Report
                </h2>
                <span className="text-sm font-semibold text-blue-700">
                  {dept.departmentName} &middot; {format(month, "MMMM yyyy")}
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-300 rounded-md">
                <table className="border-collapse text-xs w-full">
                  <thead>
                    <tr>
                      <th
                        className="border border-gray-300 p-2 sticky left-0 bg-slate-700 text-white z-10 text-sm align-middle whitespace-nowrap"
                        rowSpan={2}
                      >
                        Staff
                      </th>
                      <th
                        className="border border-gray-300 p-1 bg-slate-700 text-white text-sm align-middle"
                        colSpan={days.length + 5}
                      >
                        {format(month, "MMMM yyyy")}
                      </th>
                    </tr>
                    <tr>
                      {days.map((d, idx) => (
                        <th
                          key={idx}
                          className="border border-gray-300 p-1 bg-slate-200 text-xs align-middle w-[28px]"
                        >
                          {d.getDate()}
                        </th>
                      ))}
                      <th className="border border-gray-300 p-1 bg-blue-100 text-xs align-middle font-bold">FD</th>
                      <th className="border border-gray-300 p-1 bg-blue-100 text-xs align-middle font-bold">HD</th>
                      <th className="border border-gray-300 p-1 bg-blue-100 text-xs align-middle font-bold">P</th>
                      <th className="border border-gray-300 p-1 bg-blue-100 text-xs align-middle font-bold">A</th>
                      <th className="border border-gray-300 p-1 bg-blue-100 text-xs align-middle font-bold">HA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dept.staffReports.map((staff, staffIdx) => (
                      <tr
                        key={staff.staffId}
                        className={staffIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 p-1.5 sticky left-0 bg-inherit whitespace-nowrap text-xs font-medium align-middle">
                          {staff.staffName}
                          <p className="text-[10px] text-gray-500 font-normal">
                            {staff.staffId || "-"}
                          </p>
                        </td>
                        {days.map((d, idx) => {
                          const record = staff.attendances.find(
                            (att) =>
                              new Date(att.date).getDate() === d.getDate() &&
                              new Date(att.date).getMonth() === d.getMonth(),
                          );

                          return (
                            <td
                              key={idx}
                              className="border border-gray-300 p-0.5 text-center leading-tight align-middle"
                            >
                              {record ? (
                                <div>
                                  <div className="text-[9px] text-gray-500">
                                    {record.entryTime &&
                                      format(record.entryTime, "hh:mmaaaaa")}
                                  </div>
                                  <div className="text-[9px] text-gray-500">
                                    {record.exitTime &&
                                      format(record.exitTime, "hh:mmaaaaa")}
                                  </div>
                                  <div className="text-[10px] font-semibold">
                                    {getStatusAbbreviation(record.status)}
                                  </div>
                                </div>
                              ) : (
                                " "
                              )}
                            </td>
                          );
                        })}
                        <td
                          className="border border-gray-300 p-1 text-center cursor-pointer hover:bg-blue-100 font-semibold text-blue-700 align-middle"
                          onClick={() => openStatusModal(staff, "full-day")}
                          title="Click to view Full Day dates"
                        >
                          {staff.fullDays}
                        </td>
                        <td
                          className="border border-gray-300 p-1 text-center cursor-pointer hover:bg-blue-100 font-semibold text-blue-700 align-middle"
                          onClick={() => openStatusModal(staff, "half-day")}
                          title="Click to view & adjust Half Day dates"
                        >
                          {staff.halfDays}
                        </td>
                        <td
                          className="border border-gray-300 p-1 text-center cursor-pointer hover:bg-blue-100 font-semibold text-blue-700 align-middle"
                          onClick={() => openStatusModal(staff, "present")}
                          title="Click to view & adjust Present dates"
                        >
                          {staff.presents}
                        </td>
                        <td
                          className="border border-gray-300 p-1 text-center cursor-pointer hover:bg-blue-100 font-semibold text-blue-700 align-middle"
                          onClick={() => openStatusModal(staff, "absent")}
                          title="Click to view Absent dates"
                        >
                          {staff.absents}
                        </td>
                        <td
                          className="border border-gray-300 p-1 text-center cursor-pointer hover:bg-blue-100 font-semibold text-blue-700 align-middle"
                          onClick={() => openStatusModal(staff, "ha")}
                          title="Click to view existing HR adjustments"
                        >
                          {staff.hrAdjustments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Detail + Adjustment Modal */}
      <Modal show={!!statusModal} onClose={closeStatusModal} size="2xl">
        <Modal.Header>
          {statusModal?.staffName} — {statusModal?.typeLabel} (
          {statusModal?.records.length} dates)
        </Modal.Header>
        <Modal.Body>
          {isCurrentModalAdjustable && (
            <div className="flex justify-between items-center mb-3">
              <Badge color="info">{selectedCount} selected</Badge>
              <Button size="xs" color="gray" onClick={toggleSelectAll}>
                Select / Deselect All
              </Button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {isCurrentModalAdjustable && (
                    <th className="p-2 text-left w-10"></th>
                  )}
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Current Status</th>
                  {isCurrentModalAdjustable && (
                    <th className="p-2 text-left">Change To</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {statusModal?.records.map((rec) => {
                  const rowState = rowSelections.get(rec._id) || {
                    selected: false,
                    adjustment: "None",
                  };
                  const options = ADJUSTMENT_OPTIONS[rec.status] || [];

                  return (
                    <tr key={rec._id} className="border-t">
                      {isCurrentModalAdjustable && (
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={rowState.selected}
                            onChange={() => toggleRowSelected(rec._id)}
                          />
                        </td>
                      )}
                      <td className="p-2">
                        {format(new Date(rec.date), "dd-MM-yyyy")}
                      </td>
                      <td className="p-2">
                        {getStatusAbbreviation(rec.status)}
                        {rec.hrAdjustment && rec.hrAdjustment !== "None" && (
                          <span className="text-xs text-gray-500 block">
                            (currently: {rec.hrAdjustment})
                          </span>
                        )}
                      </td>
                      {isCurrentModalAdjustable && (
                        <td className="p-2">
                          <Select
                            sizing="sm"
                            value={rowState.adjustment}
                            onChange={(e) =>
                              setRowAdjustment(rec._id, e.target.value)
                            }
                          >
                            <option value="None">None</option>
                            {options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isCurrentModalAdjustable && selectedCount > 0 && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>{selectedCount}</strong> date(s) will be adjusted as
              chosen above.
            </div>
          )}

          <div className="flex gap-2 mt-4 justify-end">
            <Button color="gray" size="sm" onClick={closeStatusModal}>
              {isCurrentModalAdjustable ? "Cancel" : "Close"}
            </Button>
            {isCurrentModalAdjustable && (
              <Button
                color="success"
                size="sm"
                onClick={handleStatusModalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "OK"}
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const getStatusAbbreviation = (status) => {
  switch (status) {
    case "full-day":
      return "FD";
    case "half-day":
      return "HD";
    case "late":
      return "L";
    case "present":
      return "P";
    case "week-off":
      return "WO";
    case "holiday":
      return "H";
    case "absent":
      return "A";
    default:
      return status;
  }
};