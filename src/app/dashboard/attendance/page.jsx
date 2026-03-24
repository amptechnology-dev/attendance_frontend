import TabsWithDatatable from "./tabs";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import CalculateAttendanceButton from "./calculateAttendance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff Attendance",
};

export default async function Page() {
  const fetchLogs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/get?days=90`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const logs = fetchLogs?.data;

  return (
    <div>
      <div className="mb-5">
        <CalculateAttendanceButton />
      </div>
      <TabsWithDatatable data={logs} />
    </div>
  );
}
