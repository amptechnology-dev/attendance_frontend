"use client";

import { Card, Label, Button, TextInput, Select, Table } from "flowbite-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, subMonths } from "date-fns";

export default function GenerateSalaryRegister() {
  const [loading, setLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState(null); // remembered payload for download buttons

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`,
          { credentials: "include" },
        );
        const result = await res.json();
        if (res.ok) setDepartments(result?.data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    })();
  }, []);

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
    setFilters(payload);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/table/get-by-month`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
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

  async function handleDownload(kind) {
    const isExcel = kind === "excel";
    isExcel ? setDownloadingExcel(true) : setDownloadingPdf(true);

    const endpoint = isExcel
      ? "/salary/excel/get-by-month"
      : "/salary/register/pdf/get-by-month";

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
          credentials: "include",
        },
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (isExcel) {
          // Excel isn't viewable inline in the browser — trigger a download
          const a = document.createElement("a");
          a.href = url;
          a.download = `salary_register_${filters.monthYearInput}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          window.open(url, "_blank");
        }
      } else {
        const error = await res.json();
        notify(error.errors || "Something went wrong while downloading!");
      }
    } finally {
      isExcel ? setDownloadingExcel(false) : setDownloadingPdf(false);
    }
  }

  return (
    <Card>
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Salary Register
      </h5>
      <form onSubmit={handleGenerate}>
        <div className="grid md:grid-cols-3 gap-4 mb-3">
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
          <div>
            <div className="mb-2 block">
              <Label htmlFor="departmentId" value="Department" />
            </div>
            <Select id="departmentId" name="departmentId" defaultValue="all">
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="pfStatus" value="PF Status" />
            </div>
            <Select id="pfStatus" name="pfStatus" defaultValue="all">
              <option value="all">All Staff</option>
              <option value="withPF">With PF</option>
              <option value="withoutPF">Without PF</option>
            </Select>
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
          <div className="flex justify-start gap-2 mb-2">
            <Button
              color="success"
              onClick={() => handleDownload("excel")}
              isProcessing={downloadingExcel}
              disabled={downloadingExcel || downloadingPdf}
            >
              Download Excel
            </Button>
            <Button
              color="blue"
              onClick={() => handleDownload("pdf")}
              isProcessing={downloadingPdf}
              disabled={downloadingExcel || downloadingPdf}
            >
              Download PDF
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
                    if (idx === 0)
                      return <Table.Cell key={col.key}>TOTAL</Table.Cell>;
                    if (idx === 1 || idx === 2)
                      return <Table.Cell key={col.key}></Table.Cell>;
                    if (col.key === "rate")
                      return <Table.Cell key={col.key}>.</Table.Cell>;
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
