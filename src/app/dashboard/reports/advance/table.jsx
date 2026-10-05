"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "flowbite-react";

const TH =
  "border border-gray-300 px-2 py-1.5 bg-slate-200 text-[11px] font-semibold text-center whitespace-nowrap";
const TD = "border border-gray-300 px-2 py-1.5 text-center align-middle";

const statusColor = { Active: "success", Paused: "warning", Closed: "gray" };

const fmtDate = (d) => (d ? format(new Date(d), "dd/MM/yyyy") : "-");
const money = (n) => Number(n || 0).toLocaleString("en-IN");

export default function ShowTable({ data = [], period = "", loading = false }) {
  const router = useRouter();

  if (!data.length) {
    return (
      <p className="text-sm text-gray-500">
        {loading ? "Loading..." : "No advance records found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((dept) => (
        <div key={dept._id}>
          <div className="mb-2 flex items-center justify-between border-b-2 border-blue-600 pb-1">
            <h2 className="text-base font-bold text-gray-900">Advance Report</h2>
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
                </tr>
              </thead>
              <tbody>
                {dept.advances.map((a, i) => (
                  <tr
                    key={a._id}
                    className={`cursor-pointer hover:bg-blue-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                    title="Click to view advance details"
                    onClick={() => router.push(`/dashboard/reports/advance/${a._id}`)}
                  >
                    <td className={TD}>{i + 1}</td>
                    <td className={`${TD} font-semibold text-blue-700`}>
                      {a.advanceNo}
                    </td>
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
                  </tr>
                ))}
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}