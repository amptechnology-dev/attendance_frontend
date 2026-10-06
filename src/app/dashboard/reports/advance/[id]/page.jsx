import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import DownloadAdvancePdf from "./pdfButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Advance Details",
};

const fmtDate = (d) => (d ? format(new Date(d), "dd/MM/yyyy") : "-");
const fmtDateTime = (d) =>
  d ? format(new Date(d), "dd/MM/yyyy hh:mm a") : "-";
const money = (n) => Number(n || 0).toLocaleString("en-IN");
const monthLabel = (m, y) =>
  m && y ? format(new Date(y, m - 1, 1), "MMM yyyy") : "-";

const TYPE_LABEL = {
  add: "Advance Given",
  deduct: "Salary Deduction",
  update: "Adjustment / Pause",
};

const STATUS_STYLE = {
  Active: "bg-green-100 text-green-800",
  Paused: "bg-yellow-100 text-yellow-800",
  Closed: "bg-gray-200 text-gray-700",
};

// Transaction type wise color scheme
const TYPE_STYLE = {
  add: {
    row: "bg-green-50",
    badge: "bg-green-100 text-green-800 border border-green-300",
    amount: "text-green-700 font-semibold",
    sign: "+",
  },
  deduct: {
    row: "bg-red-50",
    badge: "bg-red-100 text-red-800 border border-red-300",
    amount: "text-red-700 font-semibold",
    sign: "−",
  },
  update: {
    row: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800 border border-amber-300",
    amount: "text-amber-700 font-semibold",
    sign: "",
  },
};

const DEFAULT_TYPE_STYLE = {
  row: "bg-white",
  badge: "bg-gray-100 text-gray-700 border border-gray-300",
  amount: "text-gray-900 font-semibold",
  sign: "",
};

// Summary card value color
const SUMMARY_COLOR = {
  "Advance Amount": "text-green-700",
  "Total Repayment Made": "text-red-600",
  "Pending Amount": "text-orange-600",
};

// Running balance: advance dile remaining barbe, payment hole kombe
const buildRows = (transactions = []) => {
  const sorted = [...transactions].sort(
    (x, y) => new Date(x.createdAt) - new Date(y.createdAt),
  );

  let balance = 0;

  return sorted.map((t) => {
    const amt = Math.abs(Number(t.amount || 0));

    if (typeof t.newAmount === "number") {
      // backend jodi remaining pathay, seta-i final
      balance = t.newAmount;
    } else if (t.type === "add") {
      balance += amt;
    } else if (t.type === "deduct") {
      balance = Math.max(balance - amt, 0);
    }
    // update type e newAmount na thakle balance same thakbe

    return { ...t, remaining: balance };
  });
};

export default async function Page({ params, searchParams }) {
  const { id } = await params;
  const { from } = await searchParams;

  const fromSalary = from === "salary";

  const backHref = fromSalary
    ? "/dashboard/salary/advance"
    : "/dashboard/reports/advance";
  const backLabel = fromSalary
    ? "Back to Advance Salary"
    : "Back to Advance Report";

  // Advance Salary page theke ashle PDF button hide
  const showPdfButton = !fromSalary;

  const res = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/advance/${id}`,
  ).catch((error) => {
    if (error.message === "Unauthorized") redirect("/auth/admin");
    console.log(error);
  });

  const a = res?.data;
  if (!a) notFound();

  const summary = [
    ["Staff", `${a.staffName} (${a.staffId || "-"})`],
    ["Department", a.departmentName],
    ["Date of Advance", fmtDate(a.dateOfAdvance)],
    ["Advance Amount", money(a.advanceAmount)],
    ["Total Repayment Made", money(a.totalRepaid)],
    ["Pending Amount", money(a.pendingAmount)],
    ["Last Payment Date", fmtDate(a.lastPaymentDate)],
    ["Remaining Months", a.remainingMonths],
    ["Monthly Deduction", money(a.monthlyDeduction)],
    ["Remarks", a.remarks || "-"],
  ];

  const rows = buildRows(a.transactions);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-blue-600 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            Advance Details &middot; {a.advanceNo}
          </h1>
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              STATUS_STYLE[a.status] || STATUS_STYLE.Closed
            }`}
          >
            {a.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {showPdfButton && <DownloadAdvancePdf id={a._id} />}
          <Link
            href={backHref}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            &larr; {backLabel}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-300 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p
              className={`text-sm font-semibold ${
                SUMMARY_COLOR[label] || "text-gray-900"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {a.pausedMonths?.length > 0 && (
        <div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm">
          <strong>Paused months: </strong>
          {a.pausedMonths.map((p) => monthLabel(p.month, p.year)).join(", ")}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-900">
            Transaction History
          </h2>

          {/* Color legend */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              Advance Given
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Salary Deduction
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              Adjustment / Pause
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-300">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-200 text-xs">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Date</th>
                <th className="border border-gray-300 p-2 text-left">Type</th>
                <th className="border border-gray-300 p-2 text-left">
                  Salary Month
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  Amount
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Remaining Amount
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const style = TYPE_STYLE[t.type] || DEFAULT_TYPE_STYLE;
                return (
                  <tr key={t._id} className={style.row}>
                    <td className="border border-gray-300 p-2 whitespace-nowrap">
                      {fmtDateTime(t.createdAt)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                      >
                        {TYPE_LABEL[t.type] || t.type}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-2">
                      {monthLabel(t.month, t.year)}
                    </td>
                    <td
                      className={`border border-gray-300 p-2 text-right ${style.amount}`}
                    >
                      {style.sign}
                      {money(Math.abs(t.amount))}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-semibold text-gray-900">
                      {money(t.remaining)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {t.remarks || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}