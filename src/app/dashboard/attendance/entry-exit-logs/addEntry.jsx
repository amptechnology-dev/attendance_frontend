"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function Component({ staffs = [], departments = [] }) {
  const [openModal, setOpenModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredStaffs, setFilteredStaffs] = useState(staffs);

  const router = useRouter();

  // Update staff list when department changes
  useEffect(() => {
    if (selectedDepartment) {
      setFilteredStaffs(
        staffs.filter((staff) => staff?.department?._id === selectedDepartment)
      );
    } else {
      setFilteredStaffs(staffs); // Reset to all staffs (fallback)
    }
  }, [selectedDepartment, staffs]);

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    setIsProcessing(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/entry-exit-log/new/manual/entry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Log added successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        e.target.reset();
        setOpenModal(false);
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
      <Button color="success" onClick={() => setOpenModal(true)}>
        + New Entry
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Add a Log with Entry Time </Modal.Header>
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
                <Select id="staff" name="staff_id" defaultValue="" required>
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
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="date" value="Date" />
                </div>
                <TextInput
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  max={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="entryTime" value="Entry Time" />
                </div>
                <TextInput
                  type="datetime-local"
                  id="entryTime"
                  name="entry_time"
                  defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="remarks" value="Remarks" />
                </div>
                <TextInput
                  type="text"
                  id="remarks"
                  name="remarks"
                  defaultValue="Manual Entry"
                />
              </div>
              <div className="w-full">
                <Button type="submit" color="success">
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
