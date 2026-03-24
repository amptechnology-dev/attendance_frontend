import { Card } from "flowbite-react";
import Datatable from "../components/DatatableSimple";
import { columns } from "./monthColumns";
import AddButton from "./addMonth";
import YearList from "./yearList";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Year and Month",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const fetchYearActive = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/financial-year/current`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });
  const fetchMonthActive = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/month/current`
  ).catch((error) => {
    console.log(error);
  });
  const fetchMonths = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/month/get`
  ).catch((error) => {
    console.log(error);
  });
  const fetchYears = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/financial-year/get`
  ).catch((error) => {
    console.log(error);
  });

  const currentYear = fetchYearActive?.data;
  const currentMonth = fetchMonthActive?.data;
  const allMonths = fetchMonths?.data;
  const allYears = fetchYears?.data;

  return (
    <div className="flex gap-5">
      <div>
        <Card className="max-w-md mb-5">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Financial Year: {currentYear?.yearLabel}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Start Date:{" "}
            {new Date(currentYear?.startDate)?.toLocaleDateString("en-GB")}
            <br /> End Date:{" "}
            {new Date(currentYear?.endDate)?.toLocaleDateString("en-GB")}
          </p>
        </Card>
        <YearList data={allYears} />
      </div>

      <div>
        <Card className="max-w-md mb-5">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Current Month:{" "}
            {new Date(0, currentMonth?.monthNumber - 1)?.toLocaleString(
              "default",
              {
                month: "long",
              }
            )}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Start Date:{" "}
            {new Date(currentMonth?.startDate)?.toLocaleDateString("en-GB")}
            <br /> End Date:{" "}
            {new Date(currentMonth?.endDate)?.toLocaleDateString("en-GB")}
          </p>
        </Card>

        <Datatable
          tableHeading="Manage Months"
          data={allMonths}
          columns={columns}
          Button={<AddButton allYears={allYears} />}
        />
      </div>
    </div>
  );
}
