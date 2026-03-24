"use client";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";

export default function AttendanceTable({ data = [], days = [], month = "" }) {
  const reportRef = useRef();
  const handleDownload = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: "attendance-report.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a3", orientation: "landscape" },
    };
    html2pdf()
      .set(opt)
      .from(element)
      .output("blob")
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url);
      });
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Download PDF
      </button>

      <div ref={reportRef}>
        <div className="space-y-8">
          {data?.map((dept, deptIdx) => (
            <div
              key={dept._id}
              style={deptIdx > 0 ? { pageBreakBefore: "always" } : {}}
            >
              <div className="mb-2">
                <h2 className="text-lg font-bold">
                  Attendance Report | {dept.departmentName}
                </h2>
              </div>
              <div className="overflow-auto">
                <table className="border-collapse border border-gray-400 text-sm">
                  <thead>
                    <tr>
                      <th className="border p-2" rowSpan={2}>
                        Staff
                      </th>
                      <th className="border p-2" colSpan={days.length + 3}>
                        {format(month, "MMMM yyyy")}
                      </th>
                    </tr>
                    <tr>
                      {days.map((d, idx) => (
                        <th key={idx} className="border p-1 bg-slate-300">
                          {d.getDate()}
                        </th>
                      ))}
                      <th className="border p-1 bg-slate-300">FD</th>
                      <th className="border p-1 bg-slate-300">HD</th>
                      <th className="border p-1 bg-slate-300">A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dept.staffReports.map((staff) => (
                      <tr key={staff.staffId}>
                        {/* <td className="border p-2">{staff.staffId}</td> */}
                        <td className="border p-1">{staff.staffName}</td>
                        {days.map((d, idx) => {
                          const record = staff.attendances.find(
                            (att) =>
                              new Date(att.date).getDate() === d.getDate() &&
                              new Date(att.date).getMonth() === d.getMonth()
                          );

                          return (
                            <td key={idx} className="border p-1 text-center">
                              {record ? (
                                <div>
                                  <div className="text-xs">
                                    {record.entryTime &&
                                      format(record.entryTime, "hh:mmaaaaa")}
                                  </div>
                                  <div className="text-xs">
                                    {record.exitTime &&
                                      format(record.exitTime, "hh:mmaaaaa")}
                                  </div>
                                  <div>
                                    {getStatusAbbreviation(record.status)}
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                            </td>
                          );
                        })}
                        <td className="border p-1">{staff.fullDays}</td>
                        <td className="border p-1">{staff.halfDays}</td>
                        <td className="border p-1">{staff.absents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
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
