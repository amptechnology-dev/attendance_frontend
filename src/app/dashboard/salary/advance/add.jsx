"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function getNextMonthValue() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelForPeriod(value) {
  if (!value) return "";
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function Component({ staffs = [], departments = [] }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredStaffs, setFilteredStaffs] = useState(staffs);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [months, setMonths] = useState("");
  const [pausedMonths, setPausedMonths] = useState([]); // array of "yyyy-MM"
  const [pauseInput, setPauseInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (selectedDepartment) {
      setFilteredStaffs(
        staffs.filter((s) => s.department?._id === selectedDepartment),
      );
    } else {
      setFilteredStaffs(staffs);
    }
  }, [selectedDepartment, staffs]);

  function resetForm() {
    setAdvanceAmount("");
    setMonths("");
    setPausedMonths([]);
    setPauseInput("");
  }

  function onCloseModal() {
    setOpenModal(false);
    resetForm();
  }

  function addPauseMonth() {
    if (!pauseInput) return;
    if (pausedMonths.includes(pauseInput)) {
      toast.info("Eta already list e ache.", { position: "bottom-right" });
      return;
    }
    setPausedMonths([...pausedMonths, pauseInput].sort());
    setPauseInput("");
  }

  function removePauseMonth(value) {
    setPausedMonths(pausedMonths.filter((p) => p !== value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    // "yyyy-MM" -> startMonth / startYear
    if (payload.startPeriod) {
      const [y, m] = payload.startPeriod.split("-");
      payload.startYear = Number(y);
      payload.startMonth = Number(m);
      delete payload.startPeriod;
    }

    // paused months list attach koro
    payload.pausedMonths = pausedMonths;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (response.ok) {
        toast.success("Advance added successfully!", {
          position: "bottom-right",
        });
        e.target.reset();
        resetForm();
        onCloseModal();
        router.refresh();
      } else {
        const error = await response.json();
        error.errors?.forEach((err) =>
          toast.error(err.message, { position: "bottom-right" }),
        );
      }
    } catch (error) {
      toast.error(error.message, { position: "bottom-right" });
    }
  }

  const monthlyAmount =
    Number(months) > 0 && Number(advanceAmount) >= 0
      ? Math.ceil(Number(advanceAmount) / Number(months))
      : "";

  return (
    <>
      <Button color="blue" onClick={() => setOpenModal(true)}>
        + Add Advance
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header>Add Advance</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="department" value="Department" />
                </div>
                <Select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="staff" value="Staff" />
                </div>
                <Select id="staff" name="staffId" defaultValue="" required>
                  <option value="" disabled>
                    Select a Staff
                  </option>
                  {filteredStaffs.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.staffId} - {staff.fullName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="dateTaken" value="Advance Taken On" />
                  </div>
                  <TextInput
                    type="date"
                    id="dateTaken"
                    name="dateTaken"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
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
                    required
                    defaultValue={getNextMonthValue()}
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
                    defaultValue={10000}
                    min={0}
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
                    min={0}
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
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
                    min={0}
                    max={48}
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
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
                    value={monthlyAmount}
                    min={0}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              {/* NEW — Pause specific deduction month(s), from creation time itself */}
              <div>
                <div className="mb-2 block">
                  <Label value="Pause Deduction For Specific Month(s) (optional)" />
                </div>
                <div className="flex gap-2">
                  <TextInput
                    type="month"
                    value={pauseInput}
                    onChange={(e) => setPauseInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    color="warning"
                    onClick={addPauseMonth}
                    disabled={!pauseInput}
                  >
                    + Add
                  </Button>
                </div>

                {pausedMonths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {pausedMonths.map((p) => (
                      <span
                        key={p}
                        className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                      >
                        {labelForPeriod(p)}
                        <button
                          type="button"
                          onClick={() => removePauseMonth(p)}
                          className="ml-1 font-bold"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Ei mash gulote deduction hobe na (bonus month, ba onno
                  karone). Baki mash normal cholbe.
                </p>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="remark" value="Remarks (optional)" />
                </div>
                <TextInput type="text" id="remark" name="remarks" />
              </div>

              <div>
                <Button type="submit" color="success" className="w-full">
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
