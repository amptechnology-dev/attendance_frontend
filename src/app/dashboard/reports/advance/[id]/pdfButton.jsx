"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { toast } from "react-toastify";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URI;

export default function DownloadAdvancePdf({ id }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/admin/report/advance/${id}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        let msg = "PDF generate kora jayni";
        try {
          const j = await res.json();
          msg = j.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.message, { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="xs" color="failure" onClick={handleDownload} isProcessing={loading} disabled={loading}>
      Download PDF
    </Button>
  );
}