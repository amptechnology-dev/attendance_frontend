import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import EditButton from "./editStructure";

export const metadata = {
  title: "Salary Structure",
  description: "",
};

export default async function SalaryStructure() {
  const fetchSalaryStructure = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/structure/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const salaryStructure = fetchSalaryStructure?.data;

  return (
    <div className="p-2 max-w-lg">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl">Salary Structure</h1>
        <EditButton data={salaryStructure} />
      </div>
      <Table striped>
        <TableHead>
          <TableHeadCell>Label</TableHeadCell>
          <TableHeadCell>Rate</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y">
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">Basic Salary</TableCell>
            <TableCell>{salaryStructure?.basic_percentage}%</TableCell>
          </TableRow>
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">House Rent Allowance</TableCell>
            <TableCell>{salaryStructure?.hra_allowance_percentage}%</TableCell>
          </TableRow>
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">Conveyance Allowance</TableCell>
            <TableCell>
              {salaryStructure?.conveyance_allowance_percentage}%
            </TableCell>
          </TableRow>
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">Special Allowance</TableCell>
            <TableCell>
              {salaryStructure?.special_allowance_percentage}%
            </TableCell>
          </TableRow>
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">Others Allowance</TableCell>
            <TableCell>
              {salaryStructure?.other_allowance_percentage}%
            </TableCell>
          </TableRow>
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">ESI</TableCell>
            <TableCell>{salaryStructure?.esi_rate}%</TableCell>
          </TableRow>
          <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <TableCell className="flex gap-2">PF</TableCell>
            <TableCell>{salaryStructure?.pf_rate}%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
