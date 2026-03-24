"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function Component() {
  const [openModal, setOpenModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredStaffs, setFilteredStaffs] = useState(staffs);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
  }

  async function fetchData() {
    try {
      const [departmentsRes, staffsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`, {
          credentials: "include",
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get?status=active`,
          {
            credentials: "include",
          }
        ),
      ]);

      const [departmentsData, staffsData] = await Promise.all([
        departmentsRes.json(),
        staffsRes.json(),
      ]);

      setDepartments(departmentsData?.data || []);
      setStaffs(staffsData?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data", {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  // Update staff list when department changes
  useEffect(() => {
    if (selectedDepartment) {
      setFilteredStaffs(
        staffs.filter((staff) => staff.department._id === selectedDepartment)
      );
    } else {
      setFilteredStaffs(staffs); // Reset to all staffs (fallback)
    }
  }, [selectedDepartment, staffs]);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/off-day-work/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Off day work assigned successfully!", {
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
      console.error(error);
      toast.error(error.message || "An error occurred", {
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
      <Button color="success" onClick={() => [setOpenModal(true), fetchData()]}>
        + Add New
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Assign Off Day Work </Modal.Header>
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
                  <Label htmlFor="staff" value="Select Staff" />
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
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="date" value="Work Date" />
                </div>
                <TextInput type="date" id="date" name="date" required />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="workType" value="Work Type" />
                </div>
                <Select id="workType" name="workType" required>
                  <option value="full-day">Full Day</option>
                  <option value="half-day">Half Day</option>
                  <option value="hourly">Hourly</option>
                </Select>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="benefit" value="Benefit Type" />
                </div>
                <Select id="benefit" name="benefit" required>
                  <option value="extraPay">Extra Pay</option>
                  <option value="extraLeave">Extra Leave</option>
                  <option value="compOff">Compensatory Off</option>
                </Select>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="remarks" value="Remarks (Optional)" />
                </div>
                <TextInput
                  type="text"
                  id="remarks"
                  name="remarks"
                  placeholder="Enter any additional information"
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
