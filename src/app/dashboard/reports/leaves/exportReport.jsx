"use client";

import { Button } from "flowbite-react";
import { HiDocumentText } from "react-icons/hi2";
import { useState } from "react";

export default function Component({ params = "" }) {
  const [loading, setLoading] = useState(false);

  async function submitPdf(param) {
    setLoading(true);

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/leave-pdf?${param}`,
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
      throw new Error("Failed to fetch filtered data");
    }
  }

  async function submitCsv(param) {
    setLoading(true);

    // Fetch filtered data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/report/leave-csv?${param}`,
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
      throw new Error("Failed to fetch filtered data");
    }
  }

  return (
    <Button.Group>
      <Button
        color="gray"
        size="xs"
        onClick={() => submitPdf(params)}
        isProcessing={loading}
        disabled={loading}
      >
        <HiDocumentText className="mr-3 h-4 w-4" />
        PDF
      </Button>
      <Button
        color="gray"
        size="xs"
        onClick={() => submitCsv(params)}
        isProcessing={loading}
        disabled={loading}
      >
        <HiDocumentText className="mr-3 h-4 w-4" />
        CSV
      </Button>
    </Button.Group>
  );
}
