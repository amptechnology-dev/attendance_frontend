import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import OvertimePanel from "./overtimePanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overtime" };

export default async function Page() {
  const fetchStructure = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/structure/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") redirect("/auth/admin");
  });

  return <OvertimePanel overtimeEnabled={fetchStructure?.data?.overtime?.enabled} />;
}