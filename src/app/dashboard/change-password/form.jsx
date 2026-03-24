"use client";

import { Card, Button, FloatingLabel } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Form() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!", {
        position: "bottom-right",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/admin/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Password changed successfully!", {
          position: "bottom-right",
        });
        e.target.reset();
        setNewPassword("");
        setConfirmPassword("");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        error.errors?.forEach((error) => {
          toast.error(error.message || "Something went wrong", {
            position: "bottom-right",
          });
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Network error", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Change Password
      </h5>
      <form onSubmit={handleSubmit}>
        <div className="max-w-lg space-y-4">
          <FloatingLabel
            variant="outlined"
            name="oldPassword"
            label="Current Password"
            type="password"
            required
          />
          <FloatingLabel
            variant="outlined"
            name="newPassword"
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FloatingLabel
            variant="outlined"
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            disabled={loading || newPassword !== confirmPassword}
            isProcessing={loading}
          >
            Submit
          </Button>
        </div>
      </form>
    </Card>
  );
}
