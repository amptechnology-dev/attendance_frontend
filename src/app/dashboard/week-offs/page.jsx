import Calender from "./calender";
import Datatable from "../components/DatatableSimple";
import { columns } from "./columns";
import AddRecord from "./add";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Week Offs",
};

export default async function Page() {
  const fetchHolidays = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/holiday/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });
  const fetchDepartments = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`
  ).catch((error) => {
    console.log(error);
  });

  const fetchWeekoffs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/week-off/get`
  ).catch((error) => {
    console.log(error);
  });
  const holidays = fetchHolidays?.data;
  const weekoffs = fetchWeekoffs?.data;
  const departments = fetchDepartments?.data || [];

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="lg:sticky top-0 h-fit w-full">
        <Calender holidays={holidays} weekoffs={weekoffs} />
      </div>
      <div className="flex-1">
        <Datatable
          tableHeading="Week Offs"
          columns={columns}
          data={weekoffs}
          Button={<AddRecord departments={departments} />}
        />
      </div>
    </div>
  );
}
