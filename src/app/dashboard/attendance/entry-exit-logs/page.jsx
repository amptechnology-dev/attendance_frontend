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
  const params = await searchParams;

  const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/entry-exit-log/get`;
  const logsUrl = buildLogsUrl(baseUrl, params);

  const [logsResult, staffsResult, departmentsResult] =
    await Promise.allSettled([
      fetchWithCookies(logsUrl),
      fetchWithCookies(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get?status=active`,
      ),
      fetchWithCookies(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`,
      ),
    ]);

  // Unauthorized হলে redirect
  if (
    logsResult.status === "rejected" &&
    logsResult.reason?.message === "Unauthorized"
  ) {
    redirect("/auth/admin");
  }

  const logs =
    logsResult.status === "fulfilled" ? logsResult.value?.data : undefined;
  const staffs =
    staffsResult.status === "fulfilled" ? staffsResult.value?.data : undefined;
  const departments =
    departmentsResult.status === "fulfilled"
      ? departmentsResult.value?.data
      : undefined;

  if (logsResult.status === "rejected") console.log(logsResult.reason);
  if (staffsResult.status === "rejected") console.log(staffsResult.reason);
  if (departmentsResult.status === "rejected")
    console.log(departmentsResult.reason);

  const filterLabel = params.startDate
    ? `${params.startDate} to ${params.endDate}`
    : params.date
      ? params.date
      : `Last ${params.days || 90} days`;

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
