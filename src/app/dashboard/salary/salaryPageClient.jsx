"use client";

import { useState } from "react";
import CalculateSalaryButton from "./calculateSalaryButton";
import FreezeSalaryPanel from "./freezeSalaryPanel";
import OvertimeTrigger from "../../dashboard/salary/overtime/overtimeTrigger";
import TabsWithDatatable from "./tabs";

export default function SalaryPageClient({
  allSalaryData,
  previousMonthSalary,
  previousMonthInitial,
  officeSalaryStructure,
}) {
  const [overtimeParams, setOvertimeParams] = useState(null);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <CalculateSalaryButton />
        <FreezeSalaryPanel />
        <OvertimeTrigger onSelect={setOvertimeParams} />
      </div>

      <TabsWithDatatable
        allSalaryData={allSalaryData}
        previousMonthSalary={previousMonthSalary}
        previousMonthInitial={previousMonthInitial}
        officeSalaryStructure={officeSalaryStructure}
        overtimeParams={overtimeParams}
        onExitOvertime={() => setOvertimeParams(null)}
      />
    </div>
  );
}