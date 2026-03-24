"use client";

import { Button, Modal, FloatingLabel, Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaX, FaCircleExclamation, FaFile } from "react-icons/fa6";
import { ImBoxRemove } from "react-icons/im";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function Component({
  id,
  dateFrom,
  dateTo,
  department,
  status,
  doc = "",
}) {
  const { user } = useAuth();
  const [openAcceptModal, setOpenAcceptModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDocumentModal, setOpenDocumentModal] = useState(false);
  const [departmentLeaveCount, setDepartmentLeaveCount] = useState(0);
  const router = useRouter();

  async function handleAccept(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/accept`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Leave accepted successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        e.target.reset();
        setOpenAcceptModal(false);
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

  async function handleReject(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Leave application rejected successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        e.target.reset();
        setOpenRejectModal(false);
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

  async function handleDelete(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(
          "Leave application withdrawn successfully! All associated data will be deleted.",
          {
            position: "bottom-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        e.target.reset();
        setOpenDeleteModal(false);
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

  async function fetchLeaveApplicationCount(department, dateFrom, dateTo) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/leave/get-count-by-department?department=${department}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      setDepartmentLeaveCount(data.data);
    }
  }

  return (
    <>
      <div className="flex gap-1">
        <Tooltip content="View document">
          <Button
            onClick={() => setOpenDocumentModal(true)}
            size="xs"
            color="dark"
            outline
          >
            <FaFile className="w-4" />
          </Button>
        </Tooltip>

        {hasPermission(user, permissions.APPROVE_LEAVES) && (
          <>
            {status !== "approved" && (
              <Tooltip content="Approve Leave">
                <Button
                  onClick={() => {
                    setOpenAcceptModal(true),
                      fetchLeaveApplicationCount(department, dateFrom, dateTo);
                  }}
                  size="xs"
                  color="success"
                  outline
                >
                  <FaCheck className="w-4" />
                </Button>
              </Tooltip>
            )}
            {status !== "rejected" && (
              <Tooltip content="Reject Leave">
                <Button
                  onClick={() => setOpenRejectModal(true)}
                  size="xs"
                  color="failure"
                  outline
                >
                  <FaX className="w-4" />
                </Button>
              </Tooltip>
            )}
            {status === "applied" && (
              <Tooltip content="Withdraw Leave">
                <Button
                  onClick={() => setOpenDeleteModal(true)}
                  size="xs"
                  color="purple"
                  outline
                >
                  <ImBoxRemove className="w-4" />
                </Button>
              </Tooltip>
            )}
          </>
        )}
      </div>

      <Modal
        show={openDocumentModal}
        onClose={() => setOpenDocumentModal(false)}
      >
        <Modal.Header>View Uploaded Document</Modal.Header>
        <Modal.Body>
          {doc ? <img src={doc} alt="Document" /> : "No document uploaded."}
        </Modal.Body>
      </Modal>
      <Modal
        show={openAcceptModal}
        size="md"
        onClose={() => setOpenAcceptModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaCircleExclamation className="mx-auto mb-5 h-14 w-14 text-gray-500" />
            <h3 className="text-lg font-normal text-gray-600">
              Accept this leave application?
            </h3>
            <p className="text-sm text-gray-500">
              Leaves in this department: {departmentLeaveCount}
            </p>
            <div>
              <form onSubmit={handleAccept}>
                <input type="text" hidden name="id" defaultValue={id} />
                <FloatingLabel
                  variant="filled"
                  label="Remarks (Optional)"
                  name="remarks"
                />
                <div className="flex justify-center gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isPaid"
                      value="true"
                      defaultChecked
                    />
                    <span>Paid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="isPaid" value="false" />
                    <span>Unpaid</span>
                  </label>
                </div>
                <Button type="submit" color="success" className="mt-5 mx-auto">
                  Accept Application
                </Button>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openRejectModal}
        size="md"
        onClose={() => setOpenRejectModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaCircleExclamation className="mx-auto mb-5 h-14 w-14 text-gray-500" />
            <h3 className="text-lg mb-2 font-normal text-gray-600">
              Reject this leave application?
            </h3>
            <div>
              <form onSubmit={handleReject}>
                <input type="text" hidden name="id" defaultValue={id} />
                <FloatingLabel
                  variant="filled"
                  label="Remarks"
                  name="remarks"
                  required
                />
                <Button type="submit" color="failure" className="mt-5 mx-auto">
                  Reject Application
                </Button>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openDeleteModal}
        size="md"
        onClose={() => setOpenDeleteModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaCircleExclamation className="mx-auto mb-5 h-14 w-14 text-gray-500" />
            <h3 className="text-lg mb-2 font-normal text-gray-600">
              Withdraw this leave application?
            </h3>
            <div>
              <form onSubmit={handleDelete}>
                <input type="text" hidden name="id" defaultValue={id} />
                <Button type="submit" color="failure" className="mt-5 mx-auto">
                  Withdraw Application
                </Button>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
