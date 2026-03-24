import Datatable from "../components/DatatableSimple";
import { columns } from "./columns";
import AddRecord from "./add";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Departments",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const fetchData = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const data = fetchData?.data;

  return (
    <Datatable
      tableHeading="Manage Departments"
      data={data}
      columns={columns}
      Button={<AddRecord />}
    />
  );
}
