import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "flowbite-react";
import { redirect } from "next/navigation";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import EditButton from "./editStructure";

export const metadata = {
  title: "Salary Structure",
  description: "",
};

function StatusBadge({ enabled }) {
  return (
    <Badge color={enabled ? "success" : "gray"}>
      {enabled ? "Enabled" : "Disabled"}
    </Badge>
  );
}

const HRA_LABELS = {
  basic: "Basic",
  gross: "Gross Salary",
  basicPlusDa: "Basic + DA",
};
const PF_LABELS = { basic: "Basic", basicPlusDa: "Basic + DA" };
const LWF_LABELS = {
  gross: "Gross Salary",
  basic: "Basic",
  basicPlusDa: "Basic + DA",
  actualSalary: "Actual Monthly Salary",
};

export default async function SalaryStructure() {
  const fetchSalaryStructure = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/structure/get`,
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const s = fetchSalaryStructure?.data;

  return (
    <div className="p-2 max-w-2xl">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl">Salary Structure</h1>
        <EditButton data={s} />
      </div>

      <Table striped>
        <TableHead>
          <TableHeadCell>Component</TableHeadCell>
          <TableHeadCell>Configuration</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y">
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell>Gross Salary</TableCell>
            <TableCell>
              {s?.grossSalary?.calculationType === "perDay"
                ? "No. of Days × Rate"
                : "Fixed Monthly Salary"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell>Basic Salary</TableCell>
            <TableCell>
              {s?.basicSalary?.percentage}% —{" "}
              {s?.basicSalary?.calculationType === "onTotalSalary"
                ? "On Total Salary (attendance-prorated)"
                : "On Gross Salary"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              DA <StatusBadge enabled={s?.da?.enabled} />
            </TableCell>
            <TableCell>
              {s?.da?.enabled ? `${s.da.percentage}% of Basic` : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              HRA <StatusBadge enabled={s?.hra?.enabled} />
            </TableCell>
            <TableCell>
              {s?.hra?.enabled
                ? `${s.hra.percentage}% of ${HRA_LABELS[s.hra.calculateOn]}`
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              Conveyance <StatusBadge enabled={s?.conveyance?.enabled} />
            </TableCell>
            <TableCell>
              {s?.conveyance?.enabled
                ? s.conveyance.mode === "readonly"
                  ? `${s.conveyance.percentage}% of Gross (Auto)`
                  : "Manual amount per staff"
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              Special Allowance{" "}
              <StatusBadge enabled={s?.specialAllowance?.enabled} />
            </TableCell>
            <TableCell>
              {s?.specialAllowance?.enabled
                ? "Auto: Gross − Basic − DA − HRA"
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              Other Allowances{" "}
              <StatusBadge enabled={s?.otherAllowance?.enabled} />
            </TableCell>
            <TableCell>
              {s?.otherAllowance?.enabled
                ? `${s.otherAllowance.percentage}% of Basic`
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              PF <StatusBadge enabled={s?.pf?.enabled} />
            </TableCell>
            <TableCell>
              {s?.pf?.enabled
                ? `${s.pf.rate}% of ${PF_LABELS[s.pf.calculateOn]} (capped at ₹${s.pf.wageCeiling})`
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              ESI <StatusBadge enabled={s?.esi?.enabled} />
            </TableCell>
            <TableCell>
              {s?.esi?.enabled
                ? `${s.esi.rate}% (if Actual Salary ≤ ₹${s.esi.wageCeiling})`
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              PTax <StatusBadge enabled={s?.pTax?.enabled} />
            </TableCell>
            <TableCell>{s?.pTax?.enabled ? "Slab-based" : "—"}</TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              LWF <StatusBadge enabled={s?.lwf?.enabled} />
            </TableCell>
            <TableCell>
              {s?.lwf?.enabled
                ? `₹${s.lwf.fixedAmount} if ${LWF_LABELS[s.lwf.calculateOn]} ≤ ₹${s.lwf.wageCeiling}`
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex items-center gap-2">
              Overtime <StatusBadge enabled={s?.overtime?.enabled} />
            </TableCell>
            <TableCell>
              {s?.overtime?.enabled
                ? `${s.overtime.slotMinutes} min/slot — (Salary × Slots) ÷ (Days × ${s.overtime.multiplier})`
                : "—"}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell>Bonus Rate</TableCell>
            <TableCell>{s?.bonus_rate}%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
