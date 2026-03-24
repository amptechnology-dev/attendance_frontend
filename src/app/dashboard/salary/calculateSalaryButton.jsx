"use client";

import { Button, Modal, Label, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { RiDvdAiLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function CalculateSalaryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [months, setMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Fetch available months from the backend
  const fetchMonths = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/month/get`,
        { cache: "no-store", credentials: "include" }
      );
      const data = await response?.json();
      if (response.ok) {
        setMonths(data?.data || []);
      } else {
        console.error("Error fetching months:", data.message);
      }
    } catch (error) {
      console.error("Fetch months error:", error);
    }
  };

  // Load months when the component is mounted
  useEffect(() => {
    fetchMonths();
  }, []);

  // Handle salary calculation form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/auto-calculate/month`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Salary calculated successfully!", {
          position: "bottom-right",
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to calculate salary.", {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Salary calculation error:", error);
      toast.error("An unexpected error occurred.", {
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        gradientDuoTone="purpleToBlue"
        size="lg"
        onClick={() => setIsOpen(true)}
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <RiDvdAiLine className="mr-2 h-5 w-5" />
        )}
        Calculate Salary (Auto)
      </Button>

      <Modal show={isOpen} onClose={() => setIsOpen(false)} size="md">
        <Modal.Header>Auto Calculate Salary</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="month" value="Choose a Month" />
              <TextInput
                type="month"
                name="monthYearInput"
                id="month"
                max={format(new Date(), "yyyy-MM")}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2">
              <Button type="submit" disabled={isLoading} color="success">
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> Calculating...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>
              <Button
                color="gray"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
