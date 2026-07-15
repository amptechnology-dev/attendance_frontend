import TabsWithDatatable from "./tabs";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import CalculateAttendanceButton from "./calculateAttendance";
import MissingAttendanceReport from "./MissingAttendanceReport";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff Attendance",
};

function buildAttendanceUrl(baseUrl, searchParams) {
  const { startDate, endDate, date, days } = searchParams;

  if (startDate && endDate) {
    return `${baseUrl}?startDate=${startDate}&endDate=${endDate}`;
  }
  if (date) {
    return `${baseUrl}?date=${date}`;
  }
  return `${baseUrl}?days=${days || "90"}`;
}

export default async function Page({ searchParams }) {
  const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/get`;
  const logsUrl = buildAttendanceUrl(baseUrl, searchParams);

  const fetchLogs = await fetchWithCookies(logsUrl).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const logs = fetchLogs?.data;

  const filterLabel = searchParams.startDate
    ? `${searchParams.startDate} to ${searchParams.endDate}`
    : searchParams.date
    ? searchParams.date
    : `Last ${searchParams.days || 90} days`;

  return (
    <div>
      <div className="mb-5">
        <CalculateAttendanceButton />
      </div>
      <MissingAttendanceReport />
      <TabsWithDatatable data={logs} filterLabel={filterLabel} />
    </div>
  );
}