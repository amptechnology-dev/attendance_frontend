"use client";

import { Card, Label, Button, TextInput, Table } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { format, subMonths } from "date-fns";

export default function GenerateExcel() {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [tableData, setTableData] = useState(null); // { columns, rows, totals }
  const [monthYear, setMonthYear] = useState(""); // remembered for the download step

  function notify(message) {
    toast.error(message, {
      position: "bottom-right",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setTableData(null);

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    setMonthYear(payload.monthYearInput);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/table/get-by-month`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      const result = await res.json();
      if (res.ok) {
        setTableData(result.data);
      } else {
        notify(result.errors || result.message || "Something went wrong!");
      }
    } catch (error) {
      notify("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/excel/get-by-month`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monthYearInput: monthYear }),
          credentials: "include",
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `salary_sheet_${monthYear}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const error = await res.json();
        notify(error.errors || "Something went wrong while downloading!");
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Generate Salary Sheet (Excel)
      </h5>
      <form onSubmit={handleGenerate}>
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="month-excel" value="Month" />
            </div>
            <TextInput
              id="month-excel"
              type="month"
              name="monthYearInput"
              defaultValue={format(subMonths(new Date(), 1), "yyyy-MM")}
              max={format(new Date(), "yyyy-MM")}
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" isProcessing={loading} disabled={loading}>
            Generate
          </Button>
          <Button
            type="reset"
            color="failure"
            onClick={() => setTableData(null)}
          >
            Reset
          </Button>
        </div>
      </form>

      {tableData && (
        <div className="mt-4">
          <div className="flex justify-end mb-2">
            <Button
              color="success"
              onClick={handleDownload}
              isProcessing={downloading}
              disabled={downloading}
            >
              Download Excel
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                {tableData.columns.map((col) => (
                  <Table.HeadCell key={col.key}>{col.header}</Table.HeadCell>
                ))}
              </Table.Head>
              <Table.Body className="divide-y">
                {tableData.rows.map((row) => (
                  <Table.Row
                    key={row.slNo}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    {tableData.columns.map((col) => (
                      <Table.Cell key={col.key}>{row[col.key]}</Table.Cell>
                    ))}
                  </Table.Row>
                ))}
                <Table.Row className="bg-gray-100 font-bold dark:bg-gray-700">
                  {tableData.columns.map((col, idx) => {
                    if (idx === 0) return <Table.Cell key={col.key}>TOTAL</Table.Cell>;
                    if (idx === 1) return <Table.Cell key={col.key}></Table.Cell>;
                    if (col.key === "rate") return <Table.Cell key={col.key}>.</Table.Cell>;
                    return (
                      <Table.Cell key={col.key}>
                        {tableData.totals[col.key] ?? ""}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        </div>
      )}
    </Card>
  );
}