import Datatable from "../../components/DatatableSimple";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Today Staff Attendance",
};

export default async function Page() {
  const fetchLogs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/get-today`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const logs = fetchLogs?.data;

  return (
    <div>
      <Datatable
        tableHeading="Daily Attendance Tracker"
        columns={columns}
        data={logs}
      />
    </div>
  );
}
