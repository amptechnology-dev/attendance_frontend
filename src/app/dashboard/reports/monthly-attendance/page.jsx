import Filters from "./filterData";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Monthly Attendance report",
};

export default async function Page({ searchParams }) {
  return <Filters />;
}
