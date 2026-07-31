"use client";

import { Button, Modal, Table, Tooltip, TextInput, Spinner } from "flowbite-react";
import { useState, useEffect } from "react";
import { RiFileList3Line, RiPencilLine, RiCheckLine, RiCloseLine } from "react-icons/ri";

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

// Editable row for conveyance. Pen icon only shows when the office's
// Salary Structure has conveyance.enabled === true AND mode === "input"
// (readonly/% mode is auto-calculated and must never be manually edited).
// Calls PUT /salary/:salaryId/conveyance/update with { amount }.
function EditableConveyanceRow({ salaryId, value, canEdit, onUpdated }) {
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
      setError("Enter a valid non-negative amount.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/${salaryId}/conveyance/update`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || `Request failed: ${res.status}`);
      }

      onUpdated?.(data.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating conveyance:", err);
      setError(err.message || "Failed to update conveyance.");
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
        Conveyance Allowance
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-800"
            title="Edit conveyance"
          >
            <RiPencilLine className="w-4 h-4" />
          </button>
        )}
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
            {error && <p className="text-xs text-red-500 max-w-[160px]">{error}</p>}
          </div>
        ) : (
          Math.round(value)
        )}
      </Table.Cell>
    </Table.Row>
  );
}

export default function ViewButton({
  salaryId = "",          // Salary document _id — required for the conveyance update API
  name = "",
  month = "",             // display string, e.g. "6 - 2026"
  salaryStructure = {},   // per-staff breakdown + leaves (existing usage, unchanged)
  conveyanceSettings = {}, // office-wide SalaryStructure.conveyance config: { enabled, mode, percentage }
  presentLogs = {},
}) {
  const [openModal, setOpenModal] = useState(false);
  const [dutyTiming, setDutyTiming] = useState(null);
  const [localSalaryStructure, setLocalSalaryStructure] = useState(salaryStructure);

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
            }
          );

          if (!res.ok) {
            throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
          }

          const data = await res.json();
          setDutyTiming(data?.data);
        } catch (error) {
          console.error("Error fetching duty timing:", error);
        }
      })();
    }
  }, [openModal]);

  const handleConveyanceUpdated = (recalculatedSalary) => {
    setLocalSalaryStructure((prev) => ({
      ...prev,
      ...recalculatedSalary?.breakdown,
      ...recalculatedSalary?.leaves,
    }));
  };

  // halfDayAllowed may not be loaded yet (or may be 0/missing) — fallback to 0
  // instead of letting `undefined` propagate into NaN.
  const halfDayAllowed = dutyTiming?.halfDayAllowed ?? 0;
  const adjustedHalfDays = (presentLogs.totalHalfDays ?? 0) - halfDayAllowed;

  const leaveExtra = (
    <div>
      <p className="text-xs font-extralight">
        Paid: {localSalaryStructure.totalPaidLeaves}, Unpaid:{" "}
        {localSalaryStructure.totalUnpaidLeaves}, Spc:{" "}
        {localSalaryStructure.totalHolidayLeaves}
      </p>
      <p className="text-xs font-extralight">
        Half Days: {presentLogs.totalHalfDays} (Adjusted: {adjustedHalfDays})
      </p>
    </div>
  );

  // Pen icon only shows when conveyance is enabled AND mode === "input".
  // "readonly" mode is percentage-driven (auto-calculated), never manually editable.
  const canEditConveyance = conveyanceSettings?.enabled === true && conveyanceSettings?.mode === "input";

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
            <p>Month: {month}</p>
          </div>
          <div className="flex flex-col md:flex-row justify-evenly overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Component</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {/* Basic is always present in the breakdown, never conditionally unset */}
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Basic Salary</Table.Cell>
                  <Table.Cell>{Math.round(localSalaryStructure?.basic)}</Table.Cell>
                </Table.Row>

                <ConditionalRow label="Hourly Pay" value={localSalaryStructure?.hourlyPay} />
                <ConditionalRow label="Bonus" value={localSalaryStructure?.bonus} />

                {/* DA — shows whenever da.enabled = true in Salary Structure */}
                <ConditionalRow label="Dearness Allowance (DA)" value={localSalaryStructure?.da} />

                {/* Other Allowance — shows whenever otherAllowance.enabled = true in Salary Structure */}
                <ConditionalRow label="Other Allowance" value={localSalaryStructure?.otherAllowance} />

                <ConditionalRow label="House Rent Allowance" value={localSalaryStructure?.hra} />

                <EditableConveyanceRow
                  salaryId={salaryId}
                  value={localSalaryStructure?.conveyance}
                  canEdit={canEditConveyance}
                  onUpdated={handleConveyanceUpdated}
                />

                <ConditionalRow label="Special Allowance" value={localSalaryStructure?.specialAllowance} />
              </Table.Body>
            </Table>

            <Table striped>
              <Table.Head>
                <Table.HeadCell>Deductions</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {/* Each of these renders only if the value actually exists in the
                    breakdown — i.e. the toggle was enabled in Salary Structure
                    AND (for PF/ESI specifically) the staff has pfNo/esiNo set. */}
                <ConditionalRow label="ESI" value={localSalaryStructure?.esi} />
                <ConditionalRow label="PF" value={localSalaryStructure?.pf} />
                <ConditionalRow label="Professional Tax" value={localSalaryStructure?.pTax} />

                {/* Leave deduction always present */}
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    Leave
                    {leaveExtra}
                  </Table.Cell>
                  <Table.Cell>
                    {Math.round(localSalaryStructure?.leaveDeduction)}
                  </Table.Cell>
                </Table.Row>

                <ConditionalRow label="Advance" value={localSalaryStructure?.advanceDeduction} />
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}