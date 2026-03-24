"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Component({ staffs = [], departments = [] }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredStaffs, setFilteredStaffs] = useState(staffs);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [months, setMonths] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (selectedDepartment) {
      setFilteredStaffs(
        staffs.filter((staff) => staff.department._id === selectedDepartment)
      );
    } else {
      setFilteredStaffs(staffs); // Reset to all staffs (fallback)
    }
  }, [selectedDepartment, staffs]);

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Advance added successfully!", {
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
        console.log(error);

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
                    onChange={(e) => {
                      setAdvanceAmount(e.target.value);
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
                    min={0}
                    max={48}
                    onChange={(e) => {
                      setMonths(e.target.value);
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
                    value={Math.ceil(advanceAmount / months)}
                    min={0}
                    disabled
                  />
                </div>
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
