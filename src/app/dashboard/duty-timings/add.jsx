"use client";

import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function Component({ departmentId }) {
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  if (!hasPermission(user, permissions.MANAGE_DUTY_TIMING)) return null;

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/duty-timing/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Duty Timings updated successfully!", {
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
        const errors = await response.json();
        errors.errors?.forEach((error) => {
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
      <Button color="blue" onClick={() => setOpenModal(true)} size="sm">
        + ADD
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Add Duty Timings </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <input
              type="hidden"
              name="department"
              defaultValue={departmentId}
            />
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="entryTime" value="Entry Time" />
                  </div>
                  <TextInput
                    id="entryTime"
                    name="startTime"
                    type="time"
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="firstHalfEnd" value="First Half End" />
                  </div>
                  <TextInput
                    type="time"
                    id="firstHalfEnd"
                    name="firstHalfEnd"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="secondHalfStart"
                      value="Second Half Start"
                    />
                  </div>
                  <TextInput
                    type="time"
                    id="secondHalfStart"
                    name="secondHalfStart"
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="endTime" value="Exit Time" />
                  </div>
                  <TextInput type="time" id="endTime" name="endTime" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="late" value="Allowed Late Entry" />
                  </div>
                  <TextInput
                    type="number"
                    id="late"
                    name="lateAllowed"
                    min={0}
                    max={10}
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="late_entry"
                      value="Late Entry Time (minutes)"
                    />
                  </div>
                  <TextInput
                    type="number"
                    id="late_entry"
                    name="lateEntryTime"
                    min={0}
                    max={60}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="halfDay" value="Allowed Half Day" />
                  </div>
                  <TextInput
                    type="number"
                    id="halfDay"
                    name="halfDayAllowed"
                    min={0}
                    max={10}
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="pl" value="Paid Leaves" />
                  </div>
                  <TextInput
                    type="number"
                    id="pl"
                    name="paidLeave"
                    min={1}
                    max={20}
                    required
                  />
                </div>
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
