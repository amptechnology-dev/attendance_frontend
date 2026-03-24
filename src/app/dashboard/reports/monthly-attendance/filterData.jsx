"use client";

import { Card, Button, Select, Label, TextInput, Radio } from "flowbite-react";
import { useState } from "react";
import ShowTable from "./table";
// import ExportButtons from "./exportReport";
// import { LimitDropDown } from "@/app/dashboard/components/LimitDropDown";
import { format } from "date-fns";

export default function Component() {
  const [data, setData] = useState([]);
  const [params, setParams] = useState("");
  const [month, setMonth] = useState("");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    // Build query string from filters
    const query = new URLSearchParams(
      Object.fromEntries([...formData.entries()].filter(([, v]) => v))
    );
    setParams(query);
    const selectedMonth = query.get("month");
    setMonth(selectedMonth);
    const [year, monthNumber] = selectedMonth.split("-").map(Number);
    setDays(getDaysInMonth(year, monthNumber - 1));

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/monthly-attendance?${query}`,
      {
        credentials: "include",
      }
    );

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setData(data.data);
    } else {
      throw new Error("Failed to fetch filtered data");
    }
  }

  return (
    <>
      <Card className="">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Generate Monthly Attendance Report
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="month" value="Month" />
              </div>
              <TextInput
                id="month"
                type="month"
                name="month"
                defaultValue={format(new Date(), "yyyy-MM")}
                required
                max={format(new Date(), "yyyy-MM")}
              />
            </div>
            {/* <LimitDropDown /> */}
          </div>
          <div className="flex gap-2">
            <Button type="submit" isProcessing={loading} disabled={loading}>
              Generate
            </Button>
            <Button type="reset" color="failure" onClick={() => setData([])}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
      <div className="p-3">
        <div className="flex gap-2 items-center py-3">
          <h3 className="text-lg">Genarated Report</h3>
          <div>
            {/* {data?.report?.length > 0 && <ExportButtons params={params} />} */}
          </div>
        </div>
        <ShowTable data={data} days={days} month={month} />
      </div>
    </>
  );
}

function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
