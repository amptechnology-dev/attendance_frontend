import TabsWithDatatable from "./tabs";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaves Applications",
};

export default async function Page() {
  const fetchData = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/get-all`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const data = fetchData?.data;

  return (
    <div>
      <TabsWithDatatable data={data} />
    </div>
  );
}
