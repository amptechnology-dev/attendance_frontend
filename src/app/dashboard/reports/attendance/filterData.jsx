"use client";

import { Card, Button, Select, Label, TextInput, Radio } from "flowbite-react";
import { useState } from "react";
import ShowTable from "./table";
import ExportButtons from "./exportReport";
import { format } from "date-fns";
import { LimitDropDown } from "@/app/dashboard/components/LimitDropDown";

export default function Component({ staffs = [] }) {
  const [data, setData] = useState({});
  const [params, setParams] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const obj = Object.fromEntries(
      [...formData.entries()].filter(([, v]) => v)
    );

    if (obj.status === "late") {
      delete obj.status;
      obj.isLate = true;
    }
    // Build query string from filters
    const query = new URLSearchParams(obj);
    setParams(query);

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/attendance?${query}`,
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
          Generate Attendance Report
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
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="singleDate" value="Single Date" />
              </div>
              <TextInput
                id="singleDate"
                type="date"
                name="date"
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="staff" value="Staff" />
              </div>
              <Select id="staff" name="staffId">
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
                <Label htmlFor="status" value="Final Status" />
              </div>
              <Select id="status" name="status">
                <option value="">All</option>
                <option>full-day</option>
                <option>half-day</option>
                <option>present</option>
                <option>absent</option>
                <option>late</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="sort" value="Sort By" />
              </div>
              <Select id="sort" name="sortBy">
                <option value="">Date</option>
                <option value="staffId">Staff</option>
                <option value="totalWorkTime">Working Time</option>
                <option value="breakTime">Break Time</option>
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
