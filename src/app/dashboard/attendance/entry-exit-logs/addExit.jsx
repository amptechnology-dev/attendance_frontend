"use client";

import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function Component({
  logId = "",
  date = null,
  entryTime = null,
}) {
  const [openModal, setOpenModal] = useState(false);
  // const [isForAllDepartments, setIsForAllDepartments] = useState(true);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/entry-exit-log/new/manual/exit`,
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
      <Button color="info" onClick={() => setOpenModal(true)} size="xs">
        + Add Exit Time
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Add a Log </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="log_id" value={logId} required />
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="date" value="Date" />
                </div>
                <TextInput
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={format(date, "yyyy-MM-dd")}
                  readOnly
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
                  value={format(entryTime, "yyyy-MM-dd'T'HH:mm")}
                  disabled
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="exitTime" value="Exit Time" />
                </div>
                <TextInput
                  type="datetime-local"
                  id="exitTime"
                  name="exit_time"
                  defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required
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
