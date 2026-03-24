import Datatable from "../../components/DatatableSimple";
import { columns } from "./columns";
import AddAdvance from "./add";
import ViewTrans from "./viewTrans";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Advance Salary",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const fetchData = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get-with-advance-salary`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const fetchStaffs = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const fetchTrans = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance-transaction/get`
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

  const data = fetchData?.data;
  const staffs = fetchStaffs?.data;
  const staffsWithNoAdvance = staffs?.filter(
    (staff) => !data?.some((d) => d._id.toString() === staff._id.toString())
  );

  return (
    <div>
      <div className="mb-2">
        <ViewTrans data={fetchTrans?.data} />
      </div>
      <Datatable
        tableHeading="Manage Advance Salary"
        data={data}
        columns={columns}
        Button={
          <AddAdvance
            staffs={staffsWithNoAdvance}
            departments={fetchDepartments?.data}
          />
        }
      />
    </div>
  );
}
