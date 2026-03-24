import TabsWithDatatable from "./tabs";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import CalculateSalaryButton from "./calculateSalaryButton";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Genarated Salary",
  description: "",
};

export default async function Page() {
  const fetchAllSalary = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/get/past-months?months=3`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });
  const fetchPreviousMonthSalary = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/get/previous-month`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const allSalaryData = fetchAllSalary?.data;
  const previousMonthSalary = fetchPreviousMonthSalary?.data;

  return (
    <div>
      <div className="mb-5">
        <CalculateSalaryButton />
      </div>
      <TabsWithDatatable
        allSalaryData={allSalaryData}
        previousMonthSalary={previousMonthSalary}
      />
    </div>
  );
}
