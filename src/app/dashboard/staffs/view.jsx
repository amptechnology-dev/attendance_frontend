"use client";

import { Button, Modal, Avatar, FloatingLabel } from "flowbite-react";
import { useState, useRef } from "react";
import EditableField from "./EditableField";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import voca from "voca";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";
import { format } from "date-fns";
import qs from "qs";
import DeleteButton from "./delete";

export default function Component({ id }) {
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [staff, setStaff] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
    setStaff(null);
  }

  async function fetchData() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/get/${id}`,
      { credentials: "include" }
    ).catch((error) => {
      console.log(error);
    });
    if (response.ok) {
      const data = await response.json();
      setStaff(data?.data);
      setProfilePic(data?.data?.photo || null);
    }
  }

  const handleUpdate = async (fieldName, newValue) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(qs.parse({ [fieldName]: newValue })),
        }
      );
      if (response.ok) {
        toast.success("Staff updated successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Triggers file picker
  };

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    setIsSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/update-photo/${id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("Profile picture updated successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        const { data } = await res.json();
        router.refresh();
        setProfilePic(data[0]?.photo);
      }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/staff/change-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: status }),
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("Status updated successfully!", {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        await fetchData();
        router.refresh();
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
  };

  return (
    <>
      <Button
        color="blue"
        onClick={() => [fetchData(), setOpenModal(true)]}
        size="xs"
      >
        View
      </Button>

      <Modal show={openModal} size="3xl" onClose={onCloseModal}>
        <Modal.Header> Staff Details </Modal.Header>
        <Modal.Body>
          <div className="flex gap-5">
            <div className="flex gap-2 flex-col max-w-fit">
              <Avatar
                img={profilePic}
                placeholderInitials={staff?.fullName
                  ?.match(/(\b\S)?/g)
                  .join("")}
                size="lg"
              />
              {hasPermission(user, permissions.MANAGE_STAFFS) && (
                <Button
                  size="sm"
                  onClick={handleButtonClick}
                  disabled={isSaving}
                >
                  {isSaving ? "Updating..." : "Change"}
                </Button>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                name="photo"
                hidden
                ref={fileInputRef}
                onChange={handleProfilePicUpload}
              />
              <FloatingLabel
                variant="outlined"
                label="Department"
                defaultValue={staff?.department?.name}
                className="mt-2"
                disabled
              />
              <FloatingLabel
                variant="outlined"
                label="Gender"
                defaultValue={voca.capitalize(staff?.gender)}
                disabled
              />
              <div className="mt-auto">
                <p>Status: {voca.upperCase(staff?.status)}</p>
                {hasPermission(user, permissions.MANAGE_STAFFS) &&
                  (staff?.status === "active" ? (
                    <Button
                      size="sm"
                      color="failure"
                      className="w-full"
                      onClick={() => handleStatusChange("inactive")}
                    >
                      Inactive
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      color="success"
                      className="w-full"
                      onClick={() => handleStatusChange("active")}
                    >
                      Active
                    </Button>
                  ))}
              </div>
              <p className="text-xs">
                Updated:
                <span className="italic text-gray-600">
                  {staff?.updatedAt &&
                    format(staff?.updatedAt, "dd/MM/yyyy hh:mm a")}
                </span>
              </p>
              <p className="text-xs">
                Created:
                <span className="italic text-gray-600">
                  {staff?.createdAt &&
                    format(staff?.createdAt, "dd/MM/yyyy hh:mm a")}
                </span>
              </p>
              {hasPermission(user, permissions.MANAGE_STAFFS) &&
                staff?.status !== "active" && <DeleteButton id={id} />}
            </div>
            <div className="space-y-5 w-full">
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Designation (optional)"
                  name="designation"
                  value={staff?.designation}
                  allowBlank
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Full Name"
                  name="fullName"
                  value={staff?.fullName}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Mobile"
                  type="tel"
                  name="mobile"
                  value={staff?.mobile}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Email (optional)"
                  type="email"
                  name="email"
                  value={staff?.email}
                  allowBlank
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={staff?.dateOfBirth?.split("T")[0]}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Date of Joining"
                  type="date"
                  name="dateOfJoining"
                  value={staff?.dateOfJoining?.split("T")[0]}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <div className="col-span-2">
                  <EditableField
                    label="Address"
                    name="address"
                    value={staff?.address}
                    onSave={(field, newValue) => handleUpdate(field, newValue)}
                    isSaving={isSaving}
                  />
                </div>
                <EditableField
                  label="PAN Number"
                  name="panNo"
                  value={staff?.panNo}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Aadhaar Number"
                  type="number"
                  name="aadhaarNo"
                  value={staff?.aadhaarNo}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="PF Number"
                  name="pfNo"
                  value={staff?.pfNo}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="ESI Number"
                  name="esiNo"
                  value={staff?.esiNo}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Monthly Salary"
                  type="number"
                  name="monthlySalary"
                  value={staff?.monthlySalary}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Overtime Rate"
                  type="number"
                  name="overtimeRate"
                  value={staff?.overtimeRate}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Paid Leaves"
                  type="number"
                  name="allowedPaidLeaves"
                  value={staff?.allowedPaidLeaves}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Bank Name"
                  name="bankDetails[bankName]"
                  value={staff?.bankDetails?.bankName}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Branch Name"
                  name="bankDetails[branchName]"
                  value={staff?.bankDetails?.branchName}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Account Number"
                  name="bankDetails[accountNumber]"
                  value={staff?.bankDetails?.accountNumber}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="Ac Holder Name"
                  name="bankDetails[accountHolderName]"
                  value={staff?.bankDetails?.accountHolderName}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="IFSC"
                  name="bankDetails[ifscCode]"
                  value={staff?.bankDetails?.ifscCode}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
                <EditableField
                  label="MICR"
                  type="number"
                  name="bankDetails[micrCode]"
                  value={staff?.bankDetails?.micrCode}
                  onSave={(field, newValue) => handleUpdate(field, newValue)}
                  isSaving={isSaving}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
