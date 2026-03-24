"use client";

import {
  Button,
  Modal,
  TextInput,
  Select,
  FloatingLabel,
  Radio,
  Avatar,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Component({ id }) {
  const [openModal, setOpenModal] = useState(false);
  const [staff, setStaff] = useState(null);
  const [departments, setDepartments] = useState([]);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
    setStaff(null);
  }

  async function fetchDepartments() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`,
        { cache: "no-store", credentials: "include" }
      ).catch((error) => {
        console.log(error);
      });
      const data = await response?.json();
      setDepartments(data?.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchData() {
    await fetchDepartments();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get/${id}`,
      {
        credentials: "include",
      }
    ).catch((error) => {
      console.log(error);
    });
    if (response.ok) {
      const data = await response.json();
      setStaff(data?.data);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Department updated successfully!", {
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
        toast.error(error.message, {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
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
        color="blue"
        onClick={() => [fetchData(), setOpenModal(true)]}
        size="xs"
      >
        Edit
      </Button>

      <Modal show={openModal} size="3xl" onClose={onCloseModal}>
        <Modal.Header> Staff Details </Modal.Header>
        <Modal.Body>
          <div className="flex gap-5">
            <div className="flex gap-2 flex-col">
              <Avatar
                placeholderInitials={staff?.fullName
                  ?.match(/(\b\S)?/g)
                  .join("")}
                size="lg"
              />
              <Button size="sm"> Change </Button>
              <p>Status: {staff?.status}</p>
              <p>
                Last Updated: <br />
                <span className="italic text-gray-600">
                  {new Date(staff?.updatedAt)?.toLocaleString("en-GB")}
                </span>
              </p>
              <p>
                Created: <br />
                <span className="italic text-gray-600">
                  {new Date(staff?.createdAt)?.toLocaleString("en-GB")}
                </span>
              </p>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FloatingLabel
                  variant="outlined"
                  label="Department"
                  defaultValue={staff?.department?.name}
                  disabled
                />
                {/* <Select
                    name="department"
                    defaultValue={staff?.department?._id}
                    disabled
                  >
                    <option value="">asdasd</option>
                    {departments.map((department) => (
                      <option key={department._id} value={department._id}>
                        {department.name}
                      </option>
                    ))}
                  </Select> */}
                <FloatingLabel
                  variant="outlined"
                  label="Staff ID"
                  defaultValue={staff?.staffId}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Full Name"
                  name="fullName"
                  defaultValue={staff?.fullName}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Gender"
                  defaultValue={staff?.gender}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Mobile"
                  type="tel"
                  name="mobile"
                  defaultValue={staff?.mobile}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Email (optional)"
                  type="email"
                  name="email"
                  defaultValue={staff?.email}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Designation (optional)"
                  name="designation"
                  defaultValue={staff?.designation}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Address"
                  name="address"
                  defaultValue={staff?.address}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  defaultValue={staff?.dateOfBirth?.split("T")[0]}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Date of Joining"
                  type="date"
                  name="dateOfJoining"
                  defaultValue={staff?.dateOfJoining?.split("T")[0]}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="PAN Number"
                  name="panNo"
                  defaultValue={staff?.panNo}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Aadhaar Number"
                  type="number"
                  name="aadhaarNo"
                  defaultValue={staff?.aadhaarNo}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="PF Number"
                  name="pfNo"
                  defaultValue={staff?.pfNo}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="ESI Number"
                  name="esiNo"
                  defaultValue={staff?.esiNo}
                  disabled
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FloatingLabel
                  variant="outlined"
                  label="Monthly Salary"
                  type="number"
                  name="monthlySalary"
                  defaultValue={staff?.monthlySalary}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Overtime Rate"
                  type="number"
                  name="overtimeRate"
                  defaultValue={staff?.overtimeRate}
                  disabled
                />
                <FloatingLabel
                  variant="outlined"
                  label="Advance (optional)"
                  type="number"
                  name="advance"
                  defaultValue={staff?.advance}
                  disabled
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
