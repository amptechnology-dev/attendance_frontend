import Datatable from "../components/DatatableSimple";
import { columns } from "./columns";
import AddRecord from "./add";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Staffs",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const fetchData = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const data = fetchData?.data;

  return (
    <Datatable
      tableHeading="Manage All Staffs"
      data={data}
      columns={columns}
      Button={<AddRecord />}
    />
  );
}
