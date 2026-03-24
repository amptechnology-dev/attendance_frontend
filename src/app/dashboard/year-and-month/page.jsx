import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import DateTimeWidgets from "./dateTime";

export const metadata = {
  title: "Year and Month",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const fetchServerTime = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/server-time`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const serverTime = fetchServerTime?.data;

  return <DateTimeWidgets serverTime={serverTime} />;
}
