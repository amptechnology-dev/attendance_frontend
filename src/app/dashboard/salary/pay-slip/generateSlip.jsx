"use client";

import { Card, Label, Select, Button, TextInput } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { format, subMonths } from "date-fns";

export default function Component({ staffs = [] }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    // Fetch filtered data
    let res;
    if (formData.get("staffId") === "all") {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/slip/get-by-month`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );
    } else {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/slip/get-by-staff`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );
    }
    setLoading(false);
    if (res.ok) {
      // Convert response to Blob
      const pdfBlob = await res.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open PDF in new tab
      window.open(pdfUrl, "_blank");
    } else {
      const error = await res.json();
      toast.error(error.errors || "Something went wrong!", {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  return (
    <Card className="">
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Generate Pay Slip
      </h5>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="month" value="Month" />
            </div>
            <TextInput
              id="month"
              type="month"
              name="monthYearInput"
              defaultValue={format(subMonths(new Date(), 1), "yyyy-MM")}
              max={format(new Date(), "yyyy-MM")}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="staff" value="Staff" />
            </div>
            <Select id="staff" name="staffId" required>
              <option value="all" key={0}>
                All
              </option>
              {staffs.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.fullName}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" isProcessing={loading} disabled={loading}>
            Generate
          </Button>
          <Button type="reset" color="failure">
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
