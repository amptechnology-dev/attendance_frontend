"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TextInput, Spinner } from "flowbite-react";
import { toast } from "react-toastify";
import { RiPencilLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import ViewBreakdown from "./viewBreakdown";
import ViewPresentLog from "./viewPresent";

function ConveyanceCell({ salaryId, value, canEdit }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
    setInputValue(value ?? 0);
  }, [value]);

  if (currentValue === undefined || currentValue === null) return "-";

  const handleSave = async () => {
    const amount = Number(inputValue);

    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Enter a valid non-negative amount.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/${salaryId}/conveyance/update`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const backendMessage = Array.isArray(data?.errors)
          ? data.errors.map((e) => e.message || e).join(", ")
          : data?.errors || data?.message || `Request failed: ${res.status}`;
        throw new Error(backendMessage);
      }

      setCurrentValue(data.data?.breakdown?.conveyance ?? amount);
      toast.success("Conveyance updated successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating Conveyance Allowance:", err);
      toast.error(err.message || "Failed to update Conveyance Allowance.", {
        position: "bottom-right",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setInputValue(currentValue ?? 0);
    setIsEditing(false);
  };

  if (!canEdit) {
    return Math.round(currentValue);
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <TextInput
          type="number"
          min={0}
          sizing="sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-20"
          disabled={saving}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-green-600 hover:text-green-800"
          title="Save"
        >
          {saving ? <Spinner size="sm" /> : <RiCheckLine className="w-5 h-5" />}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-red-600 hover:text-red-800"
          title="Cancel"
        >
          <RiCloseLine className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {Math.round(currentValue)}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-gray-500 hover:text-gray-800"
        title="Edit Conveyance Allowance"
      >
        <RiPencilLine className="w-4 h-4" />
      </button>
    </div>
  );
}

export const getColumns = (officeSalaryStructure) => [
  {
    accessorKey: "month",
    header: "Month",
    cell: (info) => info.getValue() + " - " + info.row.original.year,
  },
  {
    accessorKey: "staff.staffId",
    header: "Staff Id",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "staff.fullName",
    header: "Staff Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "baseSalary",
    header: "Monthly Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "grossSalary",
    header: "Gross Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "breakdown.conveyance",
    header: "Conveyance",
    cell: (info) => {
      const val = info.row.original.breakdown?.conveyance;
      const canEdit =
        officeSalaryStructure?.conveyance?.enabled === true &&
        officeSalaryStructure?.conveyance?.mode === "input";

      return (
        <ConveyanceCell
          salaryId={info.row.original._id}
          value={val}
          canEdit={canEdit}
        />
      );
    },
  },
  {
    accessorKey: "deductions",
    header: "Deductions",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "netSalary",
    header: "Net Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: (info) => format(info.getValue(), "dd-MM-yyyy hh:mm a"),
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        <ViewBreakdown
          salaryId={info.row.original._id}
          name={info.row.original.staff?.fullName}
          month={info.row.original.month + " - " + info.row.original.year}
          salaryStructure={{
            ...info.row.original.breakdown,
            ...info.row.original.leaves,
            paidDays: info.row.original.workedDays,
            deductions: info.row.original.deductions,
            netSalary: info.row.original.netSalary,
          }}
          conveyanceSettings={officeSalaryStructure?.conveyance}
          presentLogs={info.row.original.attendanceDetails}
        />
        <ViewPresentLog
          name={info.row.original.staff?.fullName}
          month={info.row.original.month + " - " + info.row.original.year}
          presentLogs={info.row.original.attendanceDetails}
          leaveLogs={info.row.original.leaves}
        />
      </div>
    ),
  },
];