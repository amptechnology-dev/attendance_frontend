import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import Table from "./table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Today's Attendance report",
};

export default async function Page({ searchParams }) {
  const fetchData = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/todays-attendance`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
  });

  const data = fetchData?.data;

  return <Table data={data} />;
}
