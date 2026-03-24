import Datatable from "@/app/dashboard/components/DatatableSimple";
import { columns } from "./columns";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "View Login Logs",
};

export default async function Page() {
  const fetchLogs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/logs/login`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });
  const logs = fetchLogs?.data;

  return (
    <div className="">
      <Datatable tableHeading="User Login Logs" columns={columns} data={logs} />
    </div>
  );
}
