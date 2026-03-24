"use client";

import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Component({ data = {} }) {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/structure/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Salary Structure updated successfully!", {
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
    <>
      <Button color="info" onClick={() => [setOpenModal(true)]}>
        Edit
      </Button>

      <Modal show={openModal} size="xl" onClose={onCloseModal}>
        <Modal.Header> Edit Salary Structure </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="basic" value="Basic Salary (%)" />
                </div>
                <TextInput
                  id="basic"
                  type="number"
                  name="basic_percentage"
                  defaultValue={data.basic_percentage}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="hra" value="HRA (%)" />
                </div>
                <TextInput
                  id="hra"
                  type="number"
                  name="hra_allowance_percentage"
                  defaultValue={data.hra_allowance_percentage}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="conveyance"
                    value="Conveyance Allowance (%)"
                  />
                </div>
                <TextInput
                  id="conveyance"
                  type="number"
                  name="conveyance_allowance_percentage"
                  defaultValue={data.conveyance_allowance_percentage}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="special" value="Special Allowance (%)" />
                </div>
                <TextInput
                  id="special"
                  type="number"
                  name="special_allowance_percentage"
                  defaultValue={data.special_allowance_percentage}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="other" value="Other Allowance (%)" />
                </div>
                <TextInput
                  id="other"
                  type="number"
                  name="other_allowance_percentage"
                  defaultValue={data.other_allowance_percentage}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div></div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="esi" value="ESI (%)" />
                </div>
                <TextInput
                  id="esi"
                  type="number"
                  name="esi_rate"
                  defaultValue={data.esi_rate}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="pf" value="PF (%)" />
                </div>
                <TextInput
                  id="pf"
                  type="number"
                  name="pf_rate"
                  defaultValue={data.pf_rate}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-center">
                <Button type="submit" color="success" className="w-full">
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
