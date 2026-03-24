"use client";

import { Card, Button, Select, Label, TextInput, Radio } from "flowbite-react";
import { useState } from "react";
import ShowTable from "./table";
import ExportButtons from "./exportReport";
import { LimitDropDown } from "@/app/dashboard/components/LimitDropDown";

export default function Component({ staffs = [], months = [] }) {
  const [data, setData] = useState({});
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
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/leave?${query}`,
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
          Generate Leaves Report
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="startDate" value="Start Date" />
              </div>
              <TextInput id="startDate" type="date" name="startDate" />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="endDate" value="End Date" />
              </div>
              <TextInput id="endDate" type="date" name="endDate" />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="staff" value="Staff" />
              </div>
              <Select id="staff" name="staff">
                <option value="" key={0}>
                  All
                </option>
                {staffs.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.staffId} - {staff.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="type" value="Type" />
              </div>
              <Select id="type" name="type">
                <option value="">All</option>
                <option value="sick">Medical Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="holidayLeave">Holiday Leave</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="status" value="Status" />
              </div>
              <Select id="status" name="status">
                <option value="">All</option>
                <option value="applied">Applied</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="sort" value="Sort By" />
              </div>
              <Select id="sort" name="sortBy">
                <option value="dateFrom">From Date</option>
                <option value="staffId">Staff Name</option>
              </Select>
              <div className="mt-2 flex gap-2">
                <div className="flex items-center gap-2">
                  <Radio id="asc" name="sortOrder" value="asc" defaultChecked />
                  <Label htmlFor="asc">Ascending</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio id="desc" name="sortOrder" value="desc" />
                  <Label htmlFor="desc">Descending</Label>
                </div>
              </div>
            </div>
            <LimitDropDown />
          </div>
          <div className="flex gap-2">
            <Button type="submit" isProcessing={loading} disabled={loading}>
              Generate
            </Button>
            <Button type="reset" color="failure" onClick={() => setData({})}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
      <div className="p-3">
        <div className="flex gap-2 items-center py-3">
          <h3 className="text-lg">Genarated Report</h3>
          <div>
            {data?.report?.length > 0 && <ExportButtons params={params} />}
          </div>
        </div>
        <ShowTable data={data} />
      </div>
    </>
  );
}
