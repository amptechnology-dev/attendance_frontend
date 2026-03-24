"use client";

import {
  Button,
  FloatingLabel,
  Modal,
  Radio,
  Label,
  Select,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";
import { format } from "date-fns";
import qs from "qs";

export default function Component() {
  const [openModal, setOpenModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [paidLeaves, setPaidLeaves] = useState(0);
  const router = useRouter();

  const { user } = useAuth();
  if (!hasPermission(user, permissions.MANAGE_STAFFS)) return null;

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bodyData = qs.parse(Object.fromEntries(formData));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Staff added successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        e.target.reset();
        setOpenModal(false);
        const data = await response.json();
        toast.info(
          `Staff Id: ${data?.data?.staffId} | Name: ${data?.data?.fullName} | Password: ${data?.data?.password}`,
          {
            autoClose: false,
            position: "top-center",
          }
        );
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

  async function fetchDefaultPaidLeave() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/duty-timing/get`,
        { cache: "no-store", credentials: "include" }
      ).catch((error) => {
        console.log(error);
      });
      const data = await response?.json();
      setPaidLeaves(data?.data?.paidLeave);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Button
        color="success"
        onClick={() => [
          fetchDefaultPaidLeave(),
          setOpenModal(true),
          fetchDepartments(),
        ]}
      >
        + Add New
      </Button>

      <Modal show={openModal} size="3xl" onClose={onCloseModal}>
        <Modal.Header> Add a new Staff </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="countries"
                  required
                  name="department"
                  defaultValue=""
                >
                  <option disabled value="">
                    Select Department
                  </option>
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </Select>
                <FloatingLabel
                  variant="outlined"
                  label="Designation (optional)"
                  name="designation"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Full Name"
                  name="fullName"
                  required
                />
                <fieldset className="flex gap-4 flex-wrap">
                  <legend className="text-sm">Gender</legend>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="male"
                      name="gender"
                      value="male"
                      defaultChecked
                    />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio id="female" name="gender" value="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </fieldset>
                <FloatingLabel
                  variant="outlined"
                  label="Mobile"
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  required
                />
                <FloatingLabel
                  variant="outlined"
                  label="Email (optional)"
                  type="email"
                  name="email"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  max={format(new Date(), "yyyy-MM-dd")}
                  required
                />
                <FloatingLabel
                  variant="outlined"
                  label="Date of Joining"
                  type="date"
                  name="dateOfJoining"
                  required
                />
                <div className="col-span-2">
                  <FloatingLabel
                    variant="outlined"
                    label="Address"
                    name="address"
                    required
                  />
                </div>

                <FloatingLabel
                  variant="outlined"
                  label="PAN Number"
                  name="panNo"
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                  maxLength={10}
                  // required //TODO: Remove later
                />
                <FloatingLabel
                  variant="outlined"
                  label="Aadhaar Number"
                  type="number"
                  name="aadhaarNo"
                  // required
                />
                <FloatingLabel
                  variant="outlined"
                  label="PF Number (optional)"
                  name="pfNo"
                />
                <FloatingLabel
                  variant="outlined"
                  label="ESI Number (optional)"
                  name="esiNo"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FloatingLabel
                  variant="outlined"
                  label="Monthly Salary"
                  type="number"
                  name="monthlySalary"
                  required
                />
                <FloatingLabel
                  variant="outlined"
                  label="Overtime Rate"
                  type="number"
                  name="overtimeRate"
                  defaultValue={200}
                  required
                />
                <FloatingLabel
                  variant="outlined"
                  label="Remaining Paid Leaves"
                  type="number"
                  name="allowedPaidLeaves"
                  defaultValue={paidLeaves}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <p className="col-span-3 text-gray-500">
                  Advance Payment (optional)
                </p>
                <FloatingLabel
                  variant="outlined"
                  label="Total Amount"
                  type="number"
                  name="advanceTotalAmount"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Remaining Amount"
                  type="number"
                  name="advanceRemainingAmount"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Remaining Months"
                  type="number"
                  name="advanceRemainingMonths"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <p className="col-span-3 text-gray-500">
                  Bank Details (optional)
                </p>
                <FloatingLabel
                  variant="outlined"
                  label="Bank Name"
                  name="bankDetails[bankName]"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Branch Name"
                  name="bankDetails[branchName]"
                />
                <FloatingLabel
                  variant="outlined"
                  label="IFSC Code"
                  name="bankDetails[ifscCode]"
                  type="text"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Account Holder Name"
                  name="bankDetails[accountHolderName]"
                />
                <FloatingLabel
                  variant="outlined"
                  label="Account Number"
                  name="bankDetails[accountNumber]"
                  type="text"
                />
                <FloatingLabel
                  variant="outlined"
                  label="MICR Code"
                  name="bankDetails[micrCode]"
                />
              </div>
              <Button type="submit" color="success" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
