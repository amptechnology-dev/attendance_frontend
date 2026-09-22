import SalaryPageClient from "./salaryPageClient";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Genarated Salary",
  description: "",
};

export default async function Page() {
  const fetchAllSalary = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/get/past-months?months=3`,
  ).catch((error) => {
    if (error.message === "Unauthorized") redirect("/auth/admin");
    console.log(error);
  });
  const fetchPreviousMonthSalary = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/get/previous-month`,
  ).catch((error) => {
    if (error.message === "Unauthorized") redirect("/auth/admin");
    console.log(error);
  });
  const fetchSalaryStructure = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/structure/get`,
  ).catch((error) => {
    if (error.message === "Unauthorized") redirect("/auth/admin");
    console.log(error);
  });

  const allSalaryData = fetchAllSalary?.data;
  const previousMonthSalary = fetchPreviousMonthSalary?.data;
  const officeSalaryStructure = fetchSalaryStructure?.data;

  // server-এ "previous month" কত, সেটা client-এর initial select value হিসেবে পাঠানো হচ্ছে
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthInitial = {
    month: prevDate.getMonth() + 1,
    year: prevDate.getFullYear(),
  };

  return (
    <SalaryPageClient
      allSalaryData={allSalaryData}
      previousMonthSalary={previousMonthSalary}
      previousMonthInitial={previousMonthInitial}
      officeSalaryStructure={officeSalaryStructure}
    />
  );
}