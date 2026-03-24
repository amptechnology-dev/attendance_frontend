"use client";

import {
  Button,
  Label,
  Modal,
  TextInput,
  Select,
  Radio,
  FileInput,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function Component() {
  const [openModal, setOpenModal] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const router = useRouter();

  const { user } = useAuth();
  if (!hasPermission(user, permissions.APPLY_LEAVES)) return null;

  function onCloseModal() {
    setOpenModal(false);
  }

  async function fetchStaffs() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get?status=active`,
      { credentials: "include" }
    );
    const data = await response.json();
    setStaffs(data?.data || []);
  }

  function countAvailableLeaves(e) {
    const staffId = e.target.value;
    const staff = staffs.find((staff) => staff._id === staffId);
    setLeaveCount(staff?.allowedPaidLeaves || 0);
  }

  function changeToDate(e) {
    const dateFrom = e.target.value;
    document.getElementById("toDate").value = dateFrom;
    document.getElementById("toDate").min = dateFrom;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/new`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Leave applied successfully!", {
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
      <Button
        color="success"
        onClick={() => [setOpenModal(true), fetchStaffs()]}
      >
        + Add New
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Apply for a Leave </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="staffs" value="Staff" />
                </div>
                <Select
                  id="staffs"
                  name="staff"
                  required
                  defaultValue=""
                  onChange={countAvailableLeaves}
                >
                  <option value="" disabled>
                    Select a staff
                  </option>
                  {staffs.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.staffId} - {staff.fullName}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-gray-700 mt-1">
                  Available PL: {leaveCount}
                </p>
              </div>
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="fromDate" value="From Date" />
                  </div>
                  <TextInput
                    type="date"
                    id="fromDate"
                    name="dateFrom"
                    required
                    onChange={changeToDate}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="toDate" value="To Date" />
                  </div>
                  <TextInput type="date" id="toDate" name="dateTo" required />
                </div>
              </div>
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <fieldset className="flex max-w-md flex-wrap gap-2">
                    <legend className="mb-4">Choose leave type</legend>
                    <div className="flex items-center gap-2">
                      <Radio
                        id="sick"
                        name="type"
                        value="sick"
                        defaultChecked
                      />
                      <Label htmlFor="sick">Sick</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio id="casual" name="type" value="casual" />
                      <Label htmlFor="casual">Casual</Label>
                    </div>
                  </fieldset>
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="reason" value="Reason" />
                  </div>
                  <TextInput type="text" id="reason" name="reason" required />
                </div>
              </div>
              <div>
                <div className="mb-1 block">
                  <Label htmlFor="document" value="Document (optional)" />
                </div>
                <FileInput
                  id="reason"
                  name="document"
                  helperText="PNG/JPEG (MAX. 5MB)."
                  accept="image/*"
                />
              </div>
              <div className="w-full">
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
