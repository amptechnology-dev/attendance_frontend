"use client";

import { Card, Button, Select, Label, TextInput, Radio } from "flowbite-react";
import { useState } from "react";
import ShowTable from "./table";
import ExportButtons from "./exportReport";
import { format } from "date-fns";

export default function Component() {
  const [data, setData] = useState([]);
  const [params, setParams] = useState("");
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

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/performance?${query}`,
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
          Generate Performance Report
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="startDate" value="Start Date" />
              </div>
              <TextInput
                id="startDate"
                type="date"
                name="startDate"
                max={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="endDate" value="End Date" />
              </div>
              <TextInput
                id="endDate"
                type="date"
                name="endDate"
                max={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="type" value="Rank By" />
              </div>
              <Select id="type" name="rankBy">
                <option value="fullDays">Total Full Days</option>
                <option value="halfDays">Total Half Days</option>
                <option value="absents">Total Absent Days</option>
                <option value="paidLeaves">Total Paid Leaves</option>
                <option value="unpaidLeaves">Total Unpaid Leaves</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="sort" value="Sort By" />
              </div>
              <div className="mt-2 flex gap-2">
                <div className="flex items-center gap-2">
                  <Radio id="desc" name="order" value="desc" defaultChecked />
                  <Label htmlFor="desc">Highest</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio id="asc" name="order" value="asc" />
                  <Label htmlFor="asc">Lowest</Label>
                </div>
              </div>
            </div>
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
          <div>{data?.length > 0 && <ExportButtons params={params} />}</div>
        </div>
        <ShowTable data={data} />
      </div>
    </>
  );
}
