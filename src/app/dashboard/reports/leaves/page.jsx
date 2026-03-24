import Filters from "./filterData";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leave report",
};

export default async function Page({ searchParams }) {
  const fetchStaffs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
  });

  const fetchMonths = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/month/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
  });

  const staffs = fetchStaffs?.data;
  const months = fetchMonths?.data;

  return <Filters staffs={staffs} months={months} />;
}
