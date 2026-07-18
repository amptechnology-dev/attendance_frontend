"use client";

import { Button, Label, Modal, TextInput, Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { BiSolidEdit } from "react-icons/bi";
import { format } from "date-fns";

export default function Component({ data = {} }) {
  const [openModal, setOpenModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    setIsProcessing(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/entry-exit-log/edit/entry`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Log updated successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        e.target.reset();
        setOpenModal(false);
        setIsProcessing(false);
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
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsProcessing(false);
    }
  }

  return (
    <>
      <Tooltip content="Edit Entry Time" placement="right">
        <BiSolidEdit
          className="text-xl font-bold cursor-pointer text-blue-500"
          onClick={() => setOpenModal(true)}
        />
      </Tooltip>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Update Entry Time </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="logId" defaultValue={data._id} />
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Staff Name" />
                </div>
                <TextInput
                  type="text"
                  id="name"
                  defaultValue={data?.staff?.fullName}
                  disabled
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="date" value="Date" />
                </div>
                <TextInput
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={format(data.date, "yyyy-MM-dd")}
                  disabled
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="entryTime" value="Entry Time" />
                </div>
                <TextInput
                  type="datetime-local"
                  id="entryTime"
                  name="entryTime"
                  defaultValue={format(data.entryTime, "yyyy-MM-dd'T'HH:mm")}
                  max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required
                />
              </div>
              <div className="w-full">
                <Button
                  type="submit"
                  color="success"
                  disabled={isProcessing}
                  isProcessing={isProcessing}
                >
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
