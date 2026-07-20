"use client";
import { useRef, useState } from "react";
import { format } from "date-fns";
import { Modal, Button, Label, Radio, Badge } from "flowbite-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ADJUSTMENT_OPTIONS = {
  present: [
    { id: "bulk-atoh", value: "Present to Half-day", label: "Present to Half-day" },
    { id: "bulk-ptof", value: "Present to Full-day", label: "Present to Full-day" },
    { id: "bulk-hourly", value: "Hourly", label: "Hourly" },
  ],
  "half-day": [
    { id: "bulk-htof", value: "Half-day to Full-day", label: "Half-day to Full-day" },
  ],
  absent: [
    { id: "bulk-atoh2", value: "Absent to Half-day", label: "Absent to Half-day" },
    { id: "bulk-atof", value: "Absent to Full-day", label: "Absent to Full-day" },
  ],
};

export default function AttendanceTable({ data = [], days = [], month = "" }) {
  const reportRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const [selected, setSelected] = useState(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustment, setAdjustment] = useState("None");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStatus = Array.from(selected.values())[0]?.status;
  const availableAdjustments = ADJUSTMENT_OPTIONS[selectedStatus] || [];

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = reportRef.current;
      const opt = {
        margin: 0.3,
        filename: "attendance-report.pdf",
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        },
        jsPDF: { unit: "in", format: "a3", orientation: "landscape" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".dept-block"] },
      };
      const blob = await html2pdf().set(opt).from(element).output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

    const toggleSelect = (record, staffName, dateLabel) => {
    if (!record?._id) return;

    if (record.status === "absent") {
      return;
    }

    // Deselect — always allowed
    if (selected.has(record._id)) {
      setSelected((prev) => {
        const next = new Map(prev);
        next.delete(record._id);
        return next;
      });
      return;
    }

    // Validation setState updater-এর বাইরে — যাতে Strict Mode-এ toast duplicate না হয়
    const existingStatuses = new Set(
      Array.from(selected.values()).map((item) => item.status)
    );

    if (existingStatuses.size > 0 && !existingStatuses.has(record.status)) {
      const existingStatus = Array.from(existingStatuses)[0];
      toast.error(
        `You can only select records with the same status. Already selected: "${getStatusAbbreviation(existingStatus)}", this one is "${getStatusAbbreviation(record.status)}".`,
        { position: "bottom-right", toastId: "status-mismatch" }
      );
      return;
    }

    setSelected((prev) => {
      const next = new Map(prev);
      next.set(record._id, { staffName, dateLabel, status: record.status });
      return next;
    });
  };

  const clearSelection = () => setSelected(new Map());

  const handleBulkSubmit = async () => {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/bulk-hr-adjustment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendanceIds: Array.from(selected.keys()),
            adjustments: adjustment,
          }),
          credentials: "include",
        },
      );
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Attendance adjusted successfully!", {
          position: "bottom-right",
        });
        setIsModalOpen(false);
        clearSelection();
        setAdjustment("None");
        router.refresh();
      } else {
        toast.error(
          result.errors?.[0]?.message || "Failed to adjust attendance.",
          {
            position: "bottom-right",
          },
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred.", {
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Badge color="info">{selected.size} selected</Badge>
            <Badge color="gray">
              Status: {getStatusAbbreviation(Array.from(selected.values())[0]?.status)}
            </Badge>
            <Button
              size="xs"
              color="success"
              onClick={() => {
                setAdjustment("None");
                setIsModalOpen(true);
              }}
            >
              Adjust Selected
            </Button>
            <Button size="xs" color="gray" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <div ref={reportRef}>
        <div className="space-y-8">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs border border-gray-300 rounded p-2 bg-gray-50">
            <span>
              <strong>FD</strong> : Full Day
            </span>
            <span>
              <strong>HD</strong> : Half Day
            </span>
            <span>
              <strong>P</strong> : Only Present
            </span>
            <span>
              <strong>A</strong> : Absent
            </span>
            <span>
              <strong>WO</strong> : Week Off
            </span>
            <span>
              <strong>H</strong> : Holiday
            </span>
            <span>
              <strong>HA</strong> : HR Adjustment
            </span>
          </div>

          {data?.map((dept, deptIdx) => (
            <div
              key={dept._id}
              className="dept-block"
              style={deptIdx > 0 ? { pageBreakBefore: "always" } : {}}
            >
              <div className="mb-2">
                <h2 className="text-lg font-bold">
                  Attendance Report | {dept.departmentName}
                </h2>
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="border-collapse border border-gray-400 text-[10px] w-full">
                  <thead>
                    <tr>
                      <th
                        className="border p-1 sticky left-0 bg-white z-10 text-[11px]"
                        rowSpan={2}
                      >
                        Staff
                      </th>
                      <th
                        className="border p-1 text-[11px]"
                        colSpan={days.length + 5}
                      >
                        {format(month, "MMMM yyyy")}
                      </th>
                    </tr>
                    <tr>
                      {days.map((d, idx) => (
                        <th key={idx} className="border p-0.5 bg-slate-300">
                          {d.getDate()}
                        </th>
                      ))}
                      <th className="border p-0.5 bg-slate-300">FD</th>
                      <th className="border p-0.5 bg-slate-300">HD</th>
                      <th className="border p-0.5 bg-slate-300">P</th>
                      <th className="border p-0.5 bg-slate-300">A</th>
                      <th className="border p-0.5 bg-slate-300">HA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dept.staffReports.map((staff) => (
                      <tr key={staff.staffId}>
                        <td className="border p-1 sticky left-0 bg-white whitespace-nowrap text-[10px] font-medium">
                          {staff.staffName}
                        </td>
                        {days.map((d, idx) => {
                          const record = staff.attendances.find(
                            (att) =>
                              new Date(att.date).getDate() === d.getDate() &&
                              new Date(att.date).getMonth() === d.getMonth(),
                          );

                          const dateLabel = format(d, "dd-MM-yyyy");
                          const isSelected = record && selected.has(record._id);

                          return (
                            <td
                              key={idx}
                              onClick={() =>
                                record &&
                                toggleSelect(record, staff.staffName, dateLabel)
                              }
                              className={`border p-0.5 text-center leading-tight ${
                                record ? "cursor-pointer hover:bg-blue-50" : ""
                              } ${isSelected ? "bg-blue-200 ring-1 ring-blue-500" : ""}`}
                              title={
                                record
                                  ? "Click to select for HR adjustment"
                                  : ""
                              }
                            >
                              {record ? (
                                <div className="relative">
                                  {isSelected && (
                                    <span className="absolute -top-0.5 -right-0.5 text-blue-700 text-[9px] font-bold">
                                      ✓
                                    </span>
                                  )}
                                  <div className="text-[8px]">
                                    {record.entryTime &&
                                      format(record.entryTime, "hh:mmaaaaa")}
                                  </div>
                                  <div className="text-[8px]">
                                    {record.exitTime &&
                                      format(record.exitTime, "hh:mmaaaaa")}
                                  </div>
                                  <div className="text-[9px] font-semibold">
                                    {getStatusAbbreviation(record.status)}
                                  </div>
                                </div>
                              ) : (
                                " "
                              )}
                            </td>
                          );
                        })}
                        <td className="border p-0.5 text-center">
                          {staff.fullDays}
                        </td>
                        <td className="border p-0.5 text-center">
                          {staff.halfDays}
                        </td>
                        <td className="border p-0.5 text-center">
                          {staff.presents}
                        </td>
                        <td className="border p-0.5 text-center">
                          {staff.absents}
                        </td>
                        <td className="border p-0.5 text-center">
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

      {/* Bulk HR Adjustment Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <Modal.Header>
          Bulk HR Adjustment ({selected.size} selected)
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50">
            {Array.from(selected.values()).map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-xs py-1 border-b last:border-b-0"
              >
                <span className="font-medium">{item.staffName}</span>
                <span className="text-gray-500">{item.dateLabel}</span>
                <span className="text-gray-400">({item.status})</span>
              </div>
            ))}
          </div>

          <fieldset className="flex max-w-md flex-col gap-2">
            <legend className="mb-2 font-medium">Choose Adjustment</legend>
            <div className="flex items-center gap-2">
              <Radio
                id="bulk-none"
                name="bulk-adjustments"
                value="None"
                checked={adjustment === "None"}
                onChange={() => setAdjustment("None")}
              />
              <Label htmlFor="bulk-none">None</Label>
            </div>

            {availableAdjustments.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <Radio
                  id={opt.id}
                  name="bulk-adjustments"
                  value={opt.value}
                  checked={adjustment === opt.value}
                  onChange={() => setAdjustment(opt.value)}
                />
                <Label htmlFor={opt.id}>{opt.label}</Label>
              </div>
            ))}
          </fieldset>

          {adjustment !== "None" && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>{selected.size}</strong> record(s) will be changed to{" "}
              <strong>"{adjustment}"</strong>.
            </div>
          )}

          <div className="flex gap-2 mt-4 justify-end">
            <Button
              color="gray"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="success"
              size="sm"
              onClick={handleBulkSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "OK"}
            </Button>
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