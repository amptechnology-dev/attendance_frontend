"use client";

import { Card, Label, TextInput, Button } from "flowbite-react";
import { useState } from "react";
import { formatDate } from "date-fns";
import { toast } from "react-toastify";

export default function Export() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const monthInput = formData.get("month");
    const [year, month] = monthInput.split("-");
    const query = new URLSearchParams({ month, year });

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/esi-ecr-csv?${query}`,
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
          Generate Monthly ESI Report
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
                max={formatDate(new Date(), "yyyy-MM")}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" isProcessing={loading} disabled={loading}>
              Download CSV
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
