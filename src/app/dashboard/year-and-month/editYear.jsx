"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function Component({ data = {} }) {
  const [openModal, setOpenModal] = useState(false);
  const [allYears, setAllYears] = useState([]);
  const router = useRouter();

  function onCloseModal() {
    setOpenModal(false);
  }

  const fetchYears = async () =>
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/financial-year/get`,
      { cache: "no-store", credentials: "include" }
    )
      .then(async (response) => {
        const data = await response.json();
        setAllYears(data?.data);
      })
      .catch((error) => {
        console.log(error);
      });

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/financial-year/update/${data._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Month updated successfully!", {
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
        toast.error(error.message, {
          position: "bottom-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
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
      <Button
        color="info"
        onClick={() => [fetchYears(), setOpenModal(true)]}
        size="xs"
      >
        Edit
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Edit Month </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="year" value="Year Label" />
                </div>
                <TextInput
                  id="year"
                  name="yearLabel"
                  defaultValue={data.yearLabel}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="startDate" value="Start Date" />
                </div>
                <TextInput
                  id="startDate"
                  type="date"
                  name="startDate"
                  defaultValue={format(data.startDate, "yyyy-MM-dd")}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="endDate" value="End Date" />
                </div>
                <TextInput
                  id="endDate"
                  type="date"
                  name="endDate"
                  defaultValue={format(data.endDate, "yyyy-MM-dd")}
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
