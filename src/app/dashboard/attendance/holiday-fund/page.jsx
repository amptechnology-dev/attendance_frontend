import Datatable from "../../components/DatatableSimple";
import { columns } from "./columns";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Holiday Fund Transactions",
  description: "",
};

export default async function Page() {
  const fetchTrans = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/holiday-fund-transaction/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const data = fetchTrans?.data;

  return (
    <Datatable
      tableHeading={`Holiday Fund (Balance: ${Math.round(
        data?.holidayFundBalance
      )})`}
      columns={columns}
      data={data?.transaction}
    />
  );
}
