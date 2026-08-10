"use client";

import {
  Button,
  Modal,
  Table,
  Tooltip,
  TextInput,
  Spinner,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  RiFileList3Line,
  RiPencilLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonthDisplay(month) {
  const match = String(month).match(/^(\d{1,2})\s*-\s*(\d{4})$/);
  if (!match) return month;
  const monthNum = Number(match[1]);
  const year = match[2];
  const monthName = MONTH_NAMES[monthNum - 1];
  return monthName ? `${monthName} - ${year}` : month;
}

function ConditionalRow({ label, value, extra = null }) {
  if (value === undefined || value === null) return null;
  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table.Cell className="flex gap-2">
        {label}
        {extra}
      </Table.Cell>
      <Table.Cell>{Math.round(value)}</Table.Cell>
    </Table.Row>
  );
}

function EditableAmountRow({
  label,
  salaryId,
  value,
  canEdit,
  endpointSuffix, // e.g. "conveyance/update" or "advance/update"
  onUpdated,
  helperText = null,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInputValue(value ?? 0);
  }, [value]);

  if (value === undefined || value === null) return null;

  const handleSave = async () => {
    const amount = Number(inputValue);

    if (Number.isNaN(amount) || amount < 0) {
      const msg = "Enter a valid non-negative amount.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/${salaryId}/${endpointSuffix}`,
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

      onUpdated?.(data.data);
      toast.success(`${label} updated successfully.`);
      setIsEditing(false);
    } catch (err) {
      console.error(`Error updating ${label}:`, err);
      const msg = err.message || `Failed to update ${label}.`;
      setError(msg);
      toast.error(msg, { position: "bottom-right" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setInputValue(value ?? 0);
    setError("");
    setIsEditing(false);
  };

  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table.Cell className="flex gap-2 items-center">
        <div>
          <div className="flex items-center gap-2">
            {label}
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-gray-800"
                title={`Edit ${label}`}
              >
                <RiPencilLine className="w-4 h-4" />
              </button>
            )}
          </div>
          {helperText}
        </div>
      </Table.Cell>
      <Table.Cell>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                min={0}
                sizing="sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-24"
                disabled={saving}
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-green-600 hover:text-green-800"
                title="Save"
              >
                {saving ? (
                  <Spinner size="sm" />
                ) : (
                  <RiCheckLine className="w-5 h-5" />
                )}
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
            {error && (
              <p className="text-xs text-red-500 max-w-[160px]">{error}</p>
            )}
          </div>
        ) : (
          Math.round(value)
        )}
      </Table.Cell>
    </Table.Row>
  );
}

export default function ViewButton({
  salaryId = "",
  name = "",
  month = "",
  salaryStructure = {},
  conveyanceSettings = {},
  presentLogs = {},
}) {
  const [openModal, setOpenModal] = useState(false);
  const [dutyTiming, setDutyTiming] = useState(null);
  const [dutyTimingLoaded, setDutyTimingLoaded] = useState(false);
  const [localSalaryStructure, setLocalSalaryStructure] =
    useState(salaryStructure);

  useEffect(() => {
    setLocalSalaryStructure(salaryStructure);
  }, [salaryStructure]);

  useEffect(() => {
    if (openModal) {
      (async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/duty-timing/get`,
            {
              method: "GET",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            },
          );

          if (!res.ok) {
            throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
          }

          const data = await res.json(); // FIXED — was missing, caused "data is not defined"
          const dutyTimingList = Array.isArray(data?.data) ? data.data : [];
          const officeDefault =
            dutyTimingList.find((d) => !d.department) || dutyTimingList[0];
          setDutyTiming(officeDefault);
        } catch (error) {
          console.error("Error fetching duty timing:", error);
        } finally {
          setDutyTimingLoaded(true);
        }
      })();
    }
  }, [openModal]);

  const handleSalaryUpdated = (recalculatedSalary) => {
    setLocalSalaryStructure((prev) => ({
      ...prev,
      ...recalculatedSalary?.breakdown,
      ...recalculatedSalary?.leaves,
      deductions: recalculatedSalary?.deductions,
      netSalary: recalculatedSalary?.netSalary,
    }));
  };

  const adjustedHalfDays = dutyTimingLoaded
    ? (presentLogs.totalHalfDays ?? 0) - (dutyTiming?.halfDayAllowed ?? 0)
    : null;

  const leaveExtra = (
    <div>
      <p className="text-xs font-extralight">
        Paid: {localSalaryStructure.totalPaidLeaves}, Unpaid:{" "}
        {localSalaryStructure.totalUnpaidLeaves}, Spc:{" "}
        {localSalaryStructure.totalHolidayLeaves}
      </p>
      <p className="text-xs font-extralight">
        Half Days: {presentLogs.totalHalfDays} · Paid Days:{" "}
        {localSalaryStructure.paidDays ?? "-"}
      </p>
    </div>
  );

  const canEditConveyance =
    conveyanceSettings?.enabled === true &&
    conveyanceSettings?.mode === "input";

  return (
    <div>
      <Tooltip content="Salary Breakdown" placement="left">
        <Button onClick={() => setOpenModal(true)} color="dark" size="xs">
          <RiFileList3Line className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Modal show={openModal} size="3xl" onClose={() => setOpenModal(false)}>
        <Modal.Header>Salary Breakdown</Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            <p>Name: {name}</p>
            <p>Month: {formatMonthDisplay(month)}</p>
          </div>
          <div className="flex flex-col md:flex-row justify-evenly overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Component</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Basic Salary</Table.Cell>
                  <Table.Cell>
                    {Math.round(localSalaryStructure?.basic)}
                  </Table.Cell>
                </Table.Row>

                <ConditionalRow
                  label="Hourly Pay"
                  value={localSalaryStructure?.hourlyPay}
                />
                <ConditionalRow
                  label="Bonus"
                  value={localSalaryStructure?.bonus}
                />
                <ConditionalRow
                  label="Dearness Allowance (DA)"
                  value={localSalaryStructure?.da}
                />
                <ConditionalRow
                  label="Other Allowance"
                  value={localSalaryStructure?.otherAllowance}
                />
                <ConditionalRow
                  label="House Rent Allowance"
                  value={localSalaryStructure?.hra}
                />

                <EditableAmountRow
                  label="Conveyance Allowance"
                  salaryId={salaryId}
                  value={localSalaryStructure?.conveyance}
                  canEdit={canEditConveyance}
                  endpointSuffix="conveyance/update"
                  onUpdated={handleSalaryUpdated}
                />

                <ConditionalRow
                  label="Special Allowance"
                  value={localSalaryStructure?.specialAllowance}
                />
              </Table.Body>
            </Table>

            <Table striped>
              <Table.Head>
                <Table.HeadCell>Deductions</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <ConditionalRow label="ESI" value={localSalaryStructure?.esi} />
                <ConditionalRow label="PF" value={localSalaryStructure?.pf} />
                <ConditionalRow
                  label="Professional Tax"
                  value={localSalaryStructure?.pTax}
                />
                <ConditionalRow label="LWF" value={localSalaryStructure?.lwf} />

                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    Leave
                    {leaveExtra}
                  </Table.Cell>
                  <Table.Cell>
                    {Math.round(localSalaryStructure?.leaveDeduction)}
                  </Table.Cell>
                </Table.Row>

                <EditableAmountRow
                  label="Advance Deduction"
                  salaryId={salaryId}
                  value={localSalaryStructure?.advanceDeduction}
                  canEdit={true}
                  endpointSuffix="advance/update"
                  onUpdated={handleSalaryUpdated}
                />
              </Table.Body>
            </Table>
          </div>

          <div className="mt-4 text-right font-semibold">
            Net Salary: ₹{Math.round(localSalaryStructure?.netSalary ?? 0)}{" "}
            &nbsp;|&nbsp; Total Deductions: ₹
            {Math.round(localSalaryStructure?.deductions ?? 0)}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
