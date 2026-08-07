"use client";

import {
  Button,
  Label,
  Modal,
  TextInput,
  Tooltip,
  Badge,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { RiEditCircleLine, RiCloseLine } from "react-icons/ri";
import { format } from "date-fns";

function toPeriodValue(month, year) {
  if (!month || !year) return "";
  return `${year}-${String(month).padStart(2, "0")}`;
}

function labelForPeriod(month, year) {
  return format(new Date(year, month - 1, 1), "MMM yyyy");
}

export default function Component({ staff }) {
  const [openModal, setOpenModal] = useState(false);
  const [advanceData, setAdvanceData] = useState(staff.advanceSalary || {});
  const [newPauseMonth, setNewPauseMonth] = useState("");
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
    setAdvanceData(staff.advanceSalary || {});
    setNewPauseMonth("");
  }

  async function postUpdate(payload) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staff._id, ...payload }),
        credentials: "include",
      },
    );
    if (!response.ok) {
      const error = await response.json();
      error.errors?.forEach((err) =>
        toast.error(err.message, { position: "bottom-right" }),
      );
      throw new Error("update failed");
    }
    return response.json();
  }

  async function handleAddPauseMonth() {
    if (!newPauseMonth) return;
    try {
      await postUpdate({ pauseMonth: newPauseMonth });
      const [y, m] = newPauseMonth.split("-").map(Number);
      setAdvanceData((prev) => ({
        ...prev,
        pausedMonths: [...(prev.pausedMonths || []), { month: m, year: y }],
      }));
      setNewPauseMonth("");
      toast.success(`${newPauseMonth} deduction paused.`, {
        position: "bottom-right",
      });
      router.refresh();
    } catch {
      // error already toasted
    }
  }

  async function handleRemovePauseMonth(month, year) {
    const periodStr = toPeriodValue(month, year);
    try {
      await postUpdate({ removePauseMonth: periodStr });
      setAdvanceData((prev) => ({
        ...prev,
        pausedMonths: (prev.pausedMonths || []).filter(
          (p) => !(p.month === month && p.year === year),
        ),
      }));
      toast.success(`${periodStr} deduction resumed.`, {
        position: "bottom-right",
      });
      router.refresh();
    } catch {
      // error already toasted
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    if (payload.startPeriod) {
      const [y, m] = payload.startPeriod.split("-");
      payload.startYear = Number(y);
      payload.startMonth = Number(m);
      delete payload.startPeriod;
    }

    try {
      await postUpdate(payload);
      toast.success("Advance updated successfully!", {
        position: "bottom-right",
      });
      e.target.reset();
      onCloseModal();
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Tooltip content="Modify" placement="left">
        <Button color="dark" size="xs" onClick={() => setOpenModal(true)}>
          <RiEditCircleLine />
        </Button>
      </Tooltip>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header>Edit Advance</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="staff" value="Staff" />
                </div>
                <input type="hidden" name="staffId" defaultValue={staff._id} />
                <TextInput
                  type="text"
                  id="staff"
                  placeholder={staff.staffId + " - " + staff.fullName}
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label value="Advance Taken On" />
                  </div>
                  <TextInput
                    type="text"
                    disabled
                    value={
                      advanceData.dateTaken
                        ? format(new Date(advanceData.dateTaken), "dd MMM yyyy")
                        : "-"
                    }
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="startPeriod"
                      value="Deduction Start Month"
                    />
                  </div>
                  <TextInput
                    type="month"
                    id="startPeriod"
                    name="startPeriod"
                    defaultValue={toPeriodValue(
                      advanceData.startMonth,
                      advanceData.startYear,
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="total" value="Total Amount" />
                  </div>
                  <TextInput
                    type="number"
                    id="total"
                    name="totalAmount"
                    required
                    defaultValue={advanceData.totalAmount}
                    min={0}
                    readOnly
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="remaining_amount"
                      value="Remaining Amount"
                    />
                  </div>
                  <TextInput
                    type="number"
                    id="remaining_amount"
                    name="remainingAmount"
                    value={advanceData.remainingAmount}
                    min={0}
                    onChange={(e) =>
                      setAdvanceData({
                        ...advanceData,
                        remainingAmount: e.target.value,
                        monthlyDeduction: Math.ceil(
                          e.target.value / (advanceData.remainingMonths || 1),
                        ),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="remaining_months"
                      value="Remaining Months"
                    />
                  </div>
                  <TextInput
                    type="number"
                    id="remaining_months"
                    name="remainingMonths"
                    value={advanceData.remainingMonths}
                    min={0}
                    onChange={(e) =>
                      setAdvanceData({
                        ...advanceData,
                        remainingMonths: e.target.value,
                        monthlyDeduction: Math.ceil(
                          (advanceData.remainingAmount || 0) /
                            (e.target.value || 1),
                        ),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="amount_month" value="Monthly Amount" />
                  </div>
                  <TextInput
                    type="number"
                    id="amount_month"
                    min={0}
                    value={advanceData.monthlyDeduction}
                    disabled
                  />
                </div>
              </div>

              {/* NEW — Pause specific months */}
              <div>
                <div className="mb-2 block">
                  <Label value="Pause Deduction For a Specific Month" />
                </div>
                <div className="flex gap-2">
                  <TextInput
                    type="month"
                    value={newPauseMonth}
                    onChange={(e) => setNewPauseMonth(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    color="warning"
                    onClick={handleAddPauseMonth}
                    disabled={!newPauseMonth}
                  >
                    Pause
                  </Button>
                </div>

                {(advanceData.pausedMonths || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {advanceData.pausedMonths.map((p) => (
                      <Badge
                        key={`${p.year}-${p.month}`}
                        color="warning"
                        className="flex items-center gap-1"
                      >
                        {labelForPeriod(p.month, p.year)}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemovePauseMonth(p.month, p.year)
                          }
                          className="ml-1"
                          title="Resume deduction for this month"
                        >
                          <RiCloseLine />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="remark" value="Remarks (optional)" />
                </div>
                <TextInput
                  type="text"
                  id="remark"
                  name="remarks"
                  value={advanceData.remarks}
                  onChange={(e) =>
                    setAdvanceData({ ...advanceData, remarks: e.target.value })
                  }
                />
              </div>

              <div>
                <Button type="submit" color="success" className="w-full">
                  Save Total / Remaining Amount
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
