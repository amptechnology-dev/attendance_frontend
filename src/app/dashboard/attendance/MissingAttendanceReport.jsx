"use client";

import { Button, Spinner, Badge, Select } from "flowbite-react";
import { useState, useEffect, useCallback } from "react";
import { RiDvdAiLine, RiCalendarCheckLine, RiLockLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

const PAGE_SIZE = 5;

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// Generates a small range of years around current year (adjust as needed)
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 1; y++) years.push(y);
  return years;
};

export default function MissingAttendanceReport() {
  const [isFetching, setIsFetching] = useState(false);
  const [missingDates, setMissingDates] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [calculatingDate, setCalculatingDate] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const router = useRouter();
  const { user } = useAuth();

  const yearOptions = getYearOptions();

  // Helper: convert ISO date string -> YYYY-MM-DD (backend expected format)
  const toApiDateFormat = (isoDate) => isoDate.split("T")[0];

  // Fetch missing attendance report (filtered by month/year)
  const fetchMissingReport = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/missing-attendance-report?month=${month}&year=${year}`,
        { credentials: "include" },
      );
      const result = await response.json();

      if (response.ok) {
        // ✅ FIX: chronological order নিশ্চিত করা হচ্ছে client-side এও,
        // যাতে "earliest = unlockable" লজিক সবসময় সঠিক date-এর উপর কাজ করে
        const sorted = [...(result.data || [])].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setMissingDates(sorted);
      } else {
        toast.error(
          result.message || "Failed to fetch missing attendance report.",
          {
            position: "bottom-right",
          },
        );
      }
    } catch (error) {
      console.error("Missing attendance report fetch error:", error);
      toast.error("An unexpected error occurred.", {
        position: "bottom-right",
      });
    } finally {
      setIsFetching(false);
    }
  }, [month, year]);

  // Fetch on mount + whenever month/year filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    fetchMissingReport();
  }, [fetchMissingReport]);

  // ✅ Permission check moved AFTER all hooks
  if (!hasPermission(user, permissions.CALCULATE_ATTENDANCE)) return null;

  // Calculate attendance for a single date
  const handleCalculate = async (isoDate) => {
    setCalculatingDate(isoDate);
    try {
      const formattedDate = toApiDateFormat(isoDate);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/calculate-by-date/${formattedDate}`,
        { credentials: "include" },
      );
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Attendance calculated successfully!", {
          position: "bottom-right",
        });
        setMissingDates((prev) => prev.filter((item) => item.date !== isoDate));
        router.refresh();
      } else {
        toast.error(result.message || "Failed to calculate attendance.", {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Attendance calculation error:", error);
      toast.error("An unexpected error occurred.", {
        position: "bottom-right",
      });
    } finally {
      setCalculatingDate(null);
    }
  };

  const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const visibleDates = missingDates.slice(0, visibleCount);
  const hasMore = visibleCount < missingDates.length;

  // ✅ FIX: শুধু সবচেয়ে পুরনো (chronologically first) missing date-ই unlocked থাকবে।
  // missingDates ইতিমধ্যে ascending order-এ sorted, তাই index 0 মানেই earliest.
  const earliestMissingDate = missingDates.length > 0 ? missingDates[0].date : null;

  return (
    <div className="w-full">
      {/* Header + Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <RiCalendarCheckLine className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Not Calculated Attendance</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select
            id="month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            sizing="sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>

          <Select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sizing="sm"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Hint when locked dates exist */}
      {missingDates.length > 1 && (
        <p className="text-xs text-gray-500 mb-3">
          Attendance can only be calculated for the oldest pending date. After that date is successfully calculated, the next pending date will be unlocked automatically.
        </p>
      )}

      {/* Content */}
      {isFetching ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : missingDates.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No missing attendance found for this month. 🎉
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visibleDates.map((item) => {
              const isRowLoading = calculatingDate === item.date;
              // ✅ FIX: এই date-টাই কি এখন unlocked (earliest) date?
              const isLocked = item.date !== earliestMissingDate;

              return (
                <div
                  key={item.date}
                  className={`flex flex-col items-center justify-between gap-2 border rounded-lg px-3 py-4 shadow-sm transition-shadow ${
                    isLocked
                      ? "bg-gray-50 dark:bg-gray-900 border-dashed opacity-70"
                      : "bg-white dark:bg-gray-800 hover:shadow-md"
                  } dark:border-gray-700`}
                >
                  <span className="font-medium text-sm text-center">
                    {formatDate(item.date)}
                  </span>

                  <Button
                    size="xs"
                    color={isLocked ? "gray" : "success"}
                    disabled={isRowLoading || isLocked}
                    onClick={() => handleCalculate(item.date)}
                    className="w-full"
                    title={
                      isLocked
                        ? "আগের তারিখগুলো আগে calculate করুন"
                        : "Calculate attendance"
                    }
                  >
                    {isRowLoading ? (
                      <Spinner size="sm" />
                    ) : isLocked ? (
                      <>
                        <RiLockLine className="mr-1 h-3 w-3" />
                        Locked
                      </>
                    ) : (
                      <>
                        <RiDvdAiLine className="mr-1 h-3 w-3" />
                        Calculate
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                color="gray"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}