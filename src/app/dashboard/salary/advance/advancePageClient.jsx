"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { toast } from "react-toastify";
import Datatable from "../../components/DatatableSimple";
import AddAdvance from "./add";
import { columns } from "./columns";
import { columns as transColumns } from "./transCols";
import AdvanceList from "./advanceList";

export default function AdvancePageClient({
  activeAdvances = [],
  initialTransactions = [],
  staffsWithNoAdvance = [],
  departments = [],
  allStaffs = [],
}) {
  const [tab, setTab] = useState("active");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState(""); // "yyyy-MM"
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("all");

  const isFirstRun = useRef(true);

  const hasFilter = month || fromDate || toDate || type !== "all";

  // Server theke notun data aante hobe jodi Add/Edit/Paid er por router.refresh() hoy
  useEffect(() => {
    if (!hasFilter) setTransactions(initialTransactions);
  }, [initialTransactions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (fromDate && toDate && fromDate > toDate) {
      toast.error("'From' date 'To' date er por hote parbe na.", {
        position: "bottom-right",
      });
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (month) {
          const [y, m] = month.split("-");
          params.set("year", y);
          params.set("month", String(Number(m)));
        }
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
        if (type !== "all") params.set("type", type);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance-transaction/get?${params.toString()}`,
          { credentials: "include", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Failed to load transactions");
        const json = await response.json();
        setTransactions(json.data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error(error.message, { position: "bottom-right" });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [month, fromDate, toDate, type]);

  function resetFilters() {
    setMonth("");
    setFromDate("");
    setToDate("");
    setType("all");
  }

  const addButton = (
    <AddAdvance staffs={staffsWithNoAdvance} departments={departments} />
  );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          color={tab === "active" ? "blue" : "gray"}
          onClick={() => setTab("active")}
        >
          Advances
        </Button>
        <Button
          size="sm"
          color={tab === "history" ? "blue" : "gray"}
          onClick={() => setTab("history")}
        >
          All Transactions
        </Button>
      </div>

      {tab === "history" ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5 items-end">
            <div>
              <div className="mb-1 block">
                <Label htmlFor="f_month" value="Month" />
              </div>
              <TextInput
                type="month"
                id="f_month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1 block">
                <Label htmlFor="f_from" value="From Date" />
              </div>
              <TextInput
                type="date"
                id="f_from"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1 block">
                <Label htmlFor="f_to" value="To Date" />
              </div>
              <TextInput
                type="date"
                id="f_to"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1 block">
                <Label htmlFor="f_type" value="Type" />
              </div>
              <Select
                id="f_type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="add">Added</option>
                <option value="deduct">Deducted</option>
                <option value="update">Updated / Paused</option>
              </Select>
            </div>
            <div>
              <Button
                color="gray"
                className="w-full"
                onClick={resetFilters}
                disabled={!hasFilter}
              >
                Reset
              </Button>
            </div>
          </div>

          {loading && <p className="mb-2 text-sm text-gray-500">Loading...</p>}

          <Datatable
            tableHeading="Advance Salary Transactions"
            data={transactions}
            columns={transColumns}
            Button={addButton}
          />
        </>
      ) : (
        <AdvanceList
          activeAdvances={activeAdvances}
          staffs={allStaffs}
          departments={departments}
          staffsWithNoAdvance={staffsWithNoAdvance}
        />
      )}
    </div>
  );
}
