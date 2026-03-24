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
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/month/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Month added successfully!", {
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
      <Button color="success" onClick={() => setOpenModal(true)}>
        + Add New
      </Button>

      <Modal show={openModal} size="md" onClose={onCloseModal}>
        <Modal.Header> Add a new month </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="month" value="Month Number" />
                </div>
                <TextInput
                  id="month"
                  type="number"
                  name="monthNumber"
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="year" value="Year" />
                </div>
                <TextInput
                  id="year"
                  type="number"
                  name="year"
                  defaultValue={new Date().getFullYear()}
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
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="endDate" value="End Date" />
                </div>
                <TextInput id="endDate" type="date" name="endDate" required />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="finYears" value="Select Financial Year" />
                </div>
                <Select
                  id="finYears"
                  name="financialYear"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a year
                  </option>
                  {allYears.map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.yearLabel}
                    </option>
                  ))}
                </Select>
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
