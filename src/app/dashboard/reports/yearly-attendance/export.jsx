"use client";

import { Card, Label, Select, Button } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Export() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const query = new URLSearchParams(
      Object.fromEntries([...formData.entries()].filter(([, v]) => v))
    );

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/yearly-attendance?${query}`,
      {
        credentials: "include",
      }
    );

    setLoading(false);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url);
      window.URL.revokeObjectURL(url);
    } else {
      const error = await res.json();
      toast.error(error.message, {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  return (
    <div>
      <Card className="">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Generate Yearly Attendance Report
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="year" value="Year" />
              </div>
              <Select id="year" name="year" required>
                {[...Array(10)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" isProcessing={loading} disabled={loading}>
              Generate PDF
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
