import { fetchWithCookies } from "@/lib/fetchWithCookies";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { formatDate } from "date-fns";
import { redirect } from "next/navigation";

export default async function LatestLeaves() {
  const fetchLeaves = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/get-all`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const leaves = (fetchLeaves?.data || []).slice(0, 10);

  return (
    <div className="overflow-x-auto w-full">
      <h1 className="text-xl text-center mb-4">Latest Leave Applications</h1>
      <Table striped>
        <TableHead>
          <TableHeadCell>Staff</TableHeadCell>
          <TableHeadCell>From Date</TableHeadCell>
          <TableHeadCell>To Date</TableHeadCell>
          <TableHeadCell>Days</TableHeadCell>
          <TableHeadCell>Type</TableHeadCell>
          <TableHeadCell>Reason</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>#</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y">
          {leaves?.map((leave) => (
            <TableRow className="bg-white" key={leave._id}>
              <TableCell>
                {leave.staff?.staffId} - {leave.staff?.fullName}
              </TableCell>
              <TableCell>{formatDate(leave.dateFrom, "dd-MM-yyyy")}</TableCell>
              <TableCell>{formatDate(leave.dateTo, "dd-MM-yyyy")}</TableCell>
              <TableCell>{leave.noOfDays}</TableCell>
              <TableCell>{leave.type}</TableCell>
              <TableCell>{leave.reason}</TableCell>
              <TableCell>
                {leave.status}
                {leave.status === "applied" && (
                  <span className="inline-flex rounded-full h-3 w-3 bg-amber-600 animate-pulse ml-1"></span>
                )}
              </TableCell>
              <TableCell>
                <a
                  href="/dashboard/attendance/leaves"
                  className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                >
                  Manage
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
