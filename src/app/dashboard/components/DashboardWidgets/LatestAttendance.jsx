import Datatable from "../DatatableSimple";
import { columns } from "@/app/dashboard/attendance/columns";
import { fetchWithCookies } from "@/lib/fetchWithCookies";

export default async function LatestAttendance() {
  const fetchLogs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/get?limit=20`
  ).catch((error) => {
    console.log(error);
  });

  return (
    <Datatable
      tableHeading="Latest Attendance"
      columns={columns}
      data={fetchLogs?.data}
    />
  );
}
