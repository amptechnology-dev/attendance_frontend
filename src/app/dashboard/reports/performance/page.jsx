import Filters from "./filterData";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Performance report",
};

export default async function Page() {
  return <Filters />;
}
