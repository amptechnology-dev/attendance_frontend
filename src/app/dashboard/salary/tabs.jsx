"use client";
import Datatable from "../components/DatatableSimple";
import { getColumns } from "./columns";
import { Tabs } from "flowbite-react";
import { FiClock, FiList } from "react-icons/fi";

export default function tabs({ allSalaryData, previousMonthSalary, officeSalaryStructure }) {
  const columns = getColumns(officeSalaryStructure);

  return (
    <Tabs aria-label="Staff-wise Salary" variant="underline">
      <Tabs.Item title="Previous Month" icon={FiClock}>
        <Datatable
          tableHeading="Previous Month's Salary"
          columns={columns}
          data={previousMonthSalary}
        />
      </Tabs.Item>
      <Tabs.Item title="Last 3 Months" icon={FiList}>
        <Datatable
          tableHeading="Last 3 Months' Salary"
          columns={columns}
          data={allSalaryData}
        />
      </Tabs.Item>
    </Tabs>
  );
}