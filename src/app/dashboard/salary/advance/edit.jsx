"use client";

import { Button, Label, Modal, TextInput, Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { RiEditCircleLine } from "react-icons/ri";
import { format } from "date-fns";

export default function Component({ staff }) {
  const [openModal, setOpenModal] = useState(false);
  const [advanceData, setAdvanceData] = useState(staff.advanceSalary || {});
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
    setAdvanceData(staff.advanceSalary || {});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Advance updated successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        e.target.reset();
        onCloseModal();
        router.refresh();
      } else {
        const error = await response.json();
        error.errors?.forEach((error) => {
          toast.error(error.message, {
            position: "bottom-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
        <Modal.Header> Edit Advance </Modal.Header>
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
                    onChange={(e) => {
                      setAdvanceData({
                        ...advanceData,
                        remainingAmount: e.target.value,
                        monthlyDeduction: Math.ceil(
                          e.target.value / (advanceData.remainingMonths || 1)
                        ),
                      });
                    }}
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
                    onChange={(e) => {
                      setAdvanceData({
                        ...advanceData,
                        remainingMonths: e.target.value,
                        monthlyDeduction: Math.ceil(
                          (advanceData.remainingAmount || 0) /
                            (e.target.value || 1)
                        ),
                      });
                    }}
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
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="pauseTill" value="Pause Deductions Till" />
                </div>
                <TextInput
                  type="month"
                  id="pauseTill"
                  name="pauseTill"
                  value={
                    advanceData.pauseTill &&
                    format(advanceData.pauseTill, "yyyy-MM")
                  }
                  onChange={(e) =>
                    setAdvanceData({
                      ...advanceData,
                      pauseTill: e.target.value,
                    })
                  }
                />
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
