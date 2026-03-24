import TabsWithDatatable from "./tabs";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entry Exit Logs",
};

export default async function Page() {
  const fetchLogs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/entry-exit-log/get?days=90`
  ).catch((error) => {
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

  return (
    <div>
      <TabsWithDatatable
        data={logs}
        staffs={staffs}
        departments={departments}
      />
    </div>
  );
}
