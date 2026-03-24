"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Component({ allYears = [] }) {
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/financial-year/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Financial Year added successfully!", {
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

        toast.error(error.message, {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
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

  return (
    <>
      <Button color="success" onClick={() => setOpenModal(true)} size="sm">
        + Add New
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Add a new Financial Year </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="year" value="Year Label" />
                </div>
                <TextInput id="year" name="yearLabel" required />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="startDate" value="Start Date" />
                </div>
                <TextInput
                  id="startDate"
                  type="date"
                  name="startDate"
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="endDate" value="End Date" />
                </div>
                <TextInput id="endDate" type="date" name="endDate" required />
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
