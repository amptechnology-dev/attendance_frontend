"use client";

import { Button, Modal, FloatingLabel, Tooltip } from "flowbite-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCircleExclamation, FaCheckToSlot } from "react-icons/fa6";
import { toast } from "react-toastify";

export default function Paid({ staffId }) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/advance/mark-as-paid`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Advance marked as fully paid!", {
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
    <div>
      <Tooltip content="Mark as fully paid" placement="left">
        <Button onClick={() => setOpenModal(true)} size="xs" color="success">
          <FaCheckToSlot />
        </Button>
      </Tooltip>

      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaCircleExclamation className="mx-auto mb-5 h-14 w-14 text-gray-500" />
            <h3 className="text-lg mb-2 font-normal text-gray-600">
              Are you sure you want to mark this advance as fully paid?
            </h3>
            <div>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  hidden
                  name="staffId"
                  defaultValue={staffId}
                />
                <FloatingLabel
                  variant="filled"
                  label="Remarks"
                  name="remarks"
                />
                <Button type="submit" color="failure" className="mt-5 mx-auto">
                  Confirm
                </Button>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
