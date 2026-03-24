"use client";

import { Button, Modal, Label, Radio, Tooltip } from "flowbite-react";
import { useState } from "react";
import { format } from "date-fns";
import { RiEditCircleLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function ViewButton({ id, data = {} }) {
  const [openModal, setOpenModal] = useState(false); // Modal visibility state
  const router = useRouter();

  const { user } = useAuth();
  if (!hasPermission(user, permissions.MANAGE_ATTENDANCE)) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/hr-adjustment/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Attendance adjusted successfully!", {
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
    <div>
      <Tooltip content="Make Adjustments" placement="left">
        <Button onClick={() => setOpenModal(true)} color="info" size="xs">
          <RiEditCircleLine className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Modal show={openModal} onClose={() => setOpenModal(false)} size="sm">
        <Modal.Header>Make Adjustments</Modal.Header>
        <Modal.Body>
          <div className="mb-2 shadow p-4 rounded-lg">
            <p>Name: {data.staffId?.fullName}</p>
            <p>Date: {format(data.date, "dd-MM-yyyy")}</p>
            <p>Current Status: {data.status}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset className="flex max-w-md flex-col gap-2">
              <legend className="mb-2">Choose Adjustment</legend>
              <div className="flex items-center gap-2">
                <Radio
                  id="none"
                  name="adjustments"
                  value="None"
                  defaultChecked
                  required
                />
                <Label htmlFor="none">None</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="htof"
                  name="adjustments"
                  value="Half-day to Full-day"
                  required
                />
                <Label htmlFor="htof">Half-day to Full-day</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="atoh"
                  name="adjustments"
                  value="Present to Half-day"
                />
                <Label htmlFor="atoh">Present to Half-day</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio id="hourly" name="adjustments" value="Hourly" />
                <Label htmlFor="hourly">Hourly</Label>
              </div>
            </fieldset>
            <div className="flex gap-2 mt-4">
              <Button color="success" size="sm" type="submit">
                Save
              </Button>
              <Button
                color="failure"
                size="sm"
                type="reset"
                onClick={() => setOpenModal(false)}
              >
                Cancle
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
