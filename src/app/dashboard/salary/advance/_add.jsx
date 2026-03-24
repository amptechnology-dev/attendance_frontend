"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Component({ staffs = [] }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [advanceData, setAdvanceData] = useState({
    totalAmount: "",
    remainingAmount: "",
    remainingMonths: "",
    monthlyAmount: 0,
    remarks: "",
  });
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
    setSelectedStaff(null);
    setAdvanceData({
      totalAmount: "",
      remainingAmount: "",
      remainingMonths: "",
      monthlyAmount: 0,
      remarks: "",
    });
  }

  const handleStaffChange = (e) => {
    const staffId = e.target.value;
    setSelectedStaff(staffId);

    const staff = staffs.find((s) => s._id === staffId);

    if (staff && staff.advanceSalary) {
      setAdvanceData({
        totalAmount: staff.advanceSalary.totalAmount || "",
        remainingAmount: staff.advanceSalary.remainingAmount || "",
        remainingMonths: staff.advanceSalary.remainingMonths || "",
        monthlyAmount: Math.ceil(
          (staff.advanceSalary.remainingAmount || 0) /
            (staff.advanceSalary.remainingMonths || 1)
        ),
        remarks: staff.advanceSalary.remarks || "",
      });
    } else {
      setAdvanceData({
        totalAmount: "",
        remainingAmount: "",
        remainingMonths: "",
        monthlyAmount: 0,
        remarks: "",
      });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance/put`,
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
        toast.error(error.message, {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
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
      <Button color="blue" onClick={() => setOpenModal(true)}>
        + Add Advance
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Add Advance </Modal.Header>
        <Modal.Body>
          {/* <p className="mb-2 text-red-500 text-xs">
            Note: If the staff already has an advance payment, it will be
            overwritten (including remaining advance, remaining months). Please
            review their existing advance before adding a new one.
          </p> */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="staff" value="Select Staff" />
                </div>
                <Select
                  id="staff"
                  defaultValue=""
                  name="staffId"
                  required
                  onChange={handleStaffChange}
                >
                  <option value="" disabled>
                    Select a Staff
                  </option>
                  {staffs.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.staffId} - {staff.fullName}
                    </option>
                  ))}
                </Select>
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
                    onChange={(e) =>
                      setAdvanceData({
                        ...advanceData,
                        totalAmount: e.target.value,
                      })
                    }
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
                        monthlyAmount: Math.ceil(
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
                        monthlyAmount: Math.ceil(
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
                    value={advanceData.monthlyAmount}
                    disabled
                  />
                </div>
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
