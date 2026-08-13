"use client";

import { useState } from "react";
import { Card, Button, Select, Label, TextInput, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiTimeLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function currentYearRange() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => y - i);
}

export default function FreezeSalaryPanel() {
  const now = new Date();
  const router = useRouter();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [locked, setLocked] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [freezing, setFreezing] = useState(false);

  const [showFreezeModal, setShowFreezeModal] = useState(false);

  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [unfreezeStep, setUnfreezeStep] = useState("request"); // "request" | "verify"
  const [otpValue, setOtpValue] = useState("");
  const [otpMobile, setOtpMobile] = useState("");
  const [unfreezing, setUnfreezing] = useState(false);

  async function fetchFreezeStatus() {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/freeze-status?month=${month}&year=${year}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to fetch freeze status");
      setLocked(Boolean(data.data?.locked));
    } catch (error) {
      toast.error(error.message);
      setLocked(false);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  }

  async function confirmFreeze() {
    setFreezing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to freeze salary");
      toast.success("Salary frozen successfully!");
      setShowFreezeModal(false);
      fetchFreezeStatus();
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFreezing(false);
    }
  }

  function openUnfreezeModal() {
    setUnfreezeStep("request");
    setOtpValue("");
    setShowUnfreezeModal(true);
  }

  async function requestUnfreeze() {
    setUnfreezing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/unfreeze/request-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to send OTP");
      setOtpMobile(data.data?.mobile || "");
      setUnfreezeStep("verify");
      toast.success("OTP sent to your registered mobile number.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnfreezing(false);
    }
  }

  async function confirmUnfreeze() {
    if (!otpValue) {
      toast.error("Please enter the OTP.");
      return;
    }
    setUnfreezing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/unfreeze/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month, year, otp: otpValue }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.errors || data?.message || "Failed to verify OTP");
      toast.success("Salary unfrozen successfully!");
      setShowUnfreezeModal(false);
      setUnfreezeStep("request");
      setOtpValue("");
      fetchFreezeStatus();
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnfreezing(false);
    }
  }

  return (
    <Card className="mb-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="freezeMonth" value="Month" />
          <Select
            id="freezeMonth"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="freezeYear" value="Year" />
          <Select
            id="freezeYear"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {currentYearRange().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={fetchFreezeStatus} isProcessing={loading} disabled={loading}>
          Check Status
        </Button>

        {hasFetched && !locked && (
          <Button color="warning" onClick={() => setShowFreezeModal(true)}>
            Salary Freeze
          </Button>
        )}

        {hasFetched && locked && (
          <Button color="failure" onClick={openUnfreezeModal}>
            Unfreeze Salary
          </Button>
        )}

        <Button color="light" onClick={() => router.push("/dashboard/salary/overtime")}>
          <RiTimeLine className="mr-2 h-5 w-5" />
          Overtime
        </Button>
      </div>

      {hasFetched && (
        <p className={`mt-3 text-sm ${locked ? "text-amber-600" : "text-gray-500"}`}>
          {locked
            ? `Salary for ${MONTH_NAMES[month - 1]} ${year} is frozen — no further changes are allowed.`
            : `Salary for ${MONTH_NAMES[month - 1]} ${year} is not frozen yet.`}
        </p>
      )}

      {/* Freeze confirmation modal */}
      <Modal show={showFreezeModal} size="md" onClose={() => setShowFreezeModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Freeze salary for {MONTH_NAMES[month - 1]} {year}?
            </h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Once frozen, salary calculation, advance salary changes, conveyance edits,
              overtime application, and bonus changes will be locked for this month. You can
              unfreeze it later with an OTP.
            </p>
            <div className="flex justify-center gap-3">
              <Button color="gray" onClick={() => setShowFreezeModal(false)}>
                Cancel
              </Button>
              <Button
                color="warning"
                onClick={confirmFreeze}
                isProcessing={freezing}
                disabled={freezing}
              >
                Yes, freeze it
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Unfreeze OTP modal */}
      <Modal show={showUnfreezeModal} size="md" onClose={() => setShowUnfreezeModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Unfreeze salary for {MONTH_NAMES[month - 1]} {year}?
            </h3>

            {unfreezeStep === "request" ? (
              <>
                <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  An OTP will be sent to your registered mobile number to confirm this action.
                </p>
                <div className="flex justify-center gap-3">
                  <Button color="gray" onClick={() => setShowUnfreezeModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="failure"
                    onClick={requestUnfreeze}
                    isProcessing={unfreezing}
                    disabled={unfreezing}
                  >
                    Send OTP
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  Enter the OTP sent to {otpMobile || "your registered number"}.
                </p>
                <TextInput
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otpValue}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setOtpValue(e.target.value);
                  }}
                  className="mb-4"
                />
                <div className="flex justify-center gap-3">
                  <Button color="gray" onClick={() => setShowUnfreezeModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="failure"
                    onClick={confirmUnfreeze}
                    isProcessing={unfreezing}
                    disabled={unfreezing}
                  >
                    Verify & Unfreeze
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
}