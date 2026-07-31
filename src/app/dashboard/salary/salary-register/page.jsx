import GenerateExcel from "./generateExcel";
import { redirect } from "next/navigation";
import { fetchWithCookies } from "@/lib/fetchWithCookies";

export const metadata = {
  title: "Generate Pay Slip",
};

export default async function Page() {
  const fetchStaffs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get`,
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
  });
  const staffs = fetchStaffs?.data;

  return (
    <div className="flex flex-col gap-4">
      <GenerateExcel staffs={staffs} />
    </div>
  );
}
