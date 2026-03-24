"use client";

import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function DeleteButton({ id }) {
  const [openModal, setOpenModal] = useState(false); // Modal visibility state
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/delete/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Staff deleted successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setOpenModal(false); // Close the modal
        router.replace("/dashboard/staffs");
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
      toast.error("An unexpected error occurred. Please try again.", {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div>
      {/* Delete button to open modal */}
      <Button onClick={() => setOpenModal(true)} color="failure" size="xs">
        Delete Staff
      </Button>

      {/* Confirmation modal */}
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this record?
            </h3>
            <p className="text-sm mb-5 text-red-600">
              Note that deleting this staff record is irreversible and will also
              delete all related data such as attendance records, salary
              records, and leave records.
            </p>
            <div className="flex justify-center gap-4">
              {/* Confirm delete */}
              <Button color="failure" onClick={handleDelete}>
                Yes, I&#39;m sure
              </Button>
              {/* Cancel delete */}
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
