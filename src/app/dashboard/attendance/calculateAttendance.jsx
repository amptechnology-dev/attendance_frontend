"use client";

import { Button, Modal, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { RiDvdAiLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function CalculateAttendanceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { user } = useAuth();
  if (!hasPermission(user, permissions.CALCULATE_ATTENDANCE)) return null;

  // Handle salary calculation form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/attendance/calculate-by-date/${date}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Attendance calculated successfully!", {
          position: "bottom-right",
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to calculate attendance.", {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Attendance calculation error:", error);
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
        Calculate Attendate
      </Button>

      <Modal show={isOpen} onClose={() => setIsOpen(false)} size="md">
        <Modal.Header>Auto Calculate Attendance</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date" value="Choose Date" />
              <TextInput
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
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
