"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Modal, Button } from "flowbite-react";
import { FiCalendar, FiClock, FiFilter } from "react-icons/fi";

const DAY_OPTIONS = [7, 15, 30, 60, 90];

export default function FilterModal({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialMode = searchParams.get("startDate")
    ? "range"
    : searchParams.get("date")
    ? "date"
    : "days";

  const [mode, setMode] = useState(initialMode);
  const [days, setDays] = useState(searchParams.get("days") || "30");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [error, setError] = useState("");

  // Modal auto-close hoye jabe jokhon navigation pending shesh hobe
  useEffect(() => {
    if (!isPending && isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const handleApply = () => {
    setError("");

    if (mode === "days") {
      if (!days || Number(days) <= 0) return setError("Enter a valid number of days");
      startTransition(() => {
        router.push(`${pathname}?days=${days}`);
      });
    }

    if (mode === "date") {
      if (!date) return setError("Please select a date");
      startTransition(() => {
        router.push(`${pathname}?date=${date}`);
      });
    }

    if (mode === "range") {
      if (!startDate || !endDate) return setError("Please select both dates");
      if (startDate > endDate) return setError("Start date can't be after end date");
      startTransition(() => {
        router.push(`${pathname}?startDate=${startDate}&endDate=${endDate}`);
      });
    }
  };

  const modes = [
    { key: "days", label: "Last N days", icon: FiClock },
    { key: "date", label: "Specific date", icon: FiCalendar },
    { key: "range", label: "Date range", icon: FiFilter },
  ];

  return (
    <Modal show={isOpen} onClose={onClose} size="md" dismissible>
      <Modal.Header>Filter logs</Modal.Header>
      <Modal.Body>
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {modes.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setError("");
                }}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  mode === key
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div className="pt-1">
            {mode === "days" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show last how many days?
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(String(d))}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        String(d) === days
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="Custom number of days"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {mode === "date" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick a date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {mode === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-end">
        <Button color="gray" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button color="blue" onClick={handleApply} disabled={isPending}>
          {isPending ? "Loading..." : "Apply filter"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}