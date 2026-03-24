"use client";

import {
  Button,
  Label,
  Modal,
  TextInput,
  Select,
  Checkbox,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { formatDate } from "date-fns";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function Component({ data }) {
  const [openModal, setOpenModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isForAllDepartments, setIsForAllDepartments] = useState(
    data?.forAllDepartments
  );
  const router = useRouter();

  const { user } = useAuth();
  if (!hasPermission(user, permissions.MANAGE_OFFDAYS)) return null;

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/week-off/update/${data._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Week Off updated successfully!", {
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

  return (
    <>
      <Button
        color="success"
        onClick={() => [fetchDepartments(), setOpenModal(true)]}
        size="xs"
      >
        Edit
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Edit Week Off </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="department" value="Select Department" />
                </div>
                <Select
                  id="department"
                  name="department"
                  disabled={isForAllDepartments}
                  required={!isForAllDepartments}
                  defaultValue={data.department?._id}
                >
                  <option
                    key={data.department?._id}
                    value={data.department?._id}
                  >
                    {data.department?.name}
                  </option>
                  {departments.map(
                    (department) =>
                      department._id !== data.department?._id && (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      )
                  )}
                </Select>
              </div>
              <div className="flex gap-2">
                <Checkbox
                  id="forAll"
                  name="forAllDepartments"
                  checked={isForAllDepartments}
                  value={isForAllDepartments}
                  onChange={(e) => setIsForAllDepartments(e.target.checked)}
                />
                <Label htmlFor="forAll">All Departments</Label>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="date" value="Date" />
                </div>
                <TextInput
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={formatDate(data.date, "yyyy-MM-dd")}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="notes" value="Reason" />
                </div>
                <TextInput
                  type="text"
                  id="notes"
                  name="reason"
                  defaultValue={data.reason}
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
