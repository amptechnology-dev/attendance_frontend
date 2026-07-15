import TabsWithDatatable from "./tabs";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entry Exit Logs",
};

function buildLogsUrl(baseUrl, searchParams) {
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
  const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/entry-exit-log/get`;
  const logsUrl = buildLogsUrl(baseUrl, searchParams);

  const fetchLogs = await fetchWithCookies(logsUrl).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });
  const fetchStaffs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get?status=active`
  ).catch((error) => {
    console.log(error);
  });
  const fetchDepartments = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`
  ).catch((error) => {
    console.log(error);
  });

  const logs = fetchLogs?.data;
  const staffs = fetchStaffs?.data;
  const departments = fetchDepartments?.data;

  const filterLabel = searchParams.startDate
    ? `${searchParams.startDate} to ${searchParams.endDate}`
    : searchParams.date
    ? searchParams.date
    : `Last ${searchParams.days || 90} days`;

  return (
    <div>
      <TabsWithDatatable
        data={logs}
        staffs={staffs}
        departments={departments}
        filterLabel={filterLabel}
      />
    </div>
  );
}