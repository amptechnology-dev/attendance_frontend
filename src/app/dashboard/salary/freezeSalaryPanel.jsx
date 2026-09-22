"use client";

import { useState } from "react";
import { Button, Select, Label, TextInput, Modal, Spinner } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentYearRange() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => y - i);
}

export default function FreezeSalaryPanel() {
  const now = new Date();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState("picker"); // "picker" | "confirmFreeze" | "otpRequest" | "otpVerify"

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [unfreezing, setUnfreezing] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpMobile, setOtpMobile] = useState("");

  async function fetchFreezeStatus(m, y) {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/salary/freeze-status?month=${m}&year=${y}`,
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
      setLoading(false);
    }
  }

  function openModal() {
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    setMonth(m);
    setYear(y);
    setStep("picker");
    setShowModal(true);
    fetchFreezeStatus(m, y);
  }

  function closeModal() {
    setShowModal(false);
    setStep("picker");
    setOtpValue("");
  }

  function handleMonthYearChange(m, y) {
    setMonth(m);
    setYear(y);
    fetchFreezeStatus(m, y);
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
      closeModal();
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFreezing(false);
    }
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
      if (!res.ok) throw new Error(data?.errors || data?.message || "Failed to send OTP");
      setOtpMobile(data.data?.mobile || "");
      setStep("otpVerify");
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
      if (!res.ok) throw new Error(data?.errors || data?.message || "Failed to verify OTP");
      toast.success("Salary unfrozen successfully!");
      closeModal();
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnfreezing(false);
    }
  }

  return (
    <>
      <Button color="warning" onClick={openModal}>
        Salary Freeze
      </Button>

      <Modal show={showModal} size="md" onClose={closeModal} popup>
        <Modal.Header />
        <Modal.Body>
          {step === "picker" && (
            <div>
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
                Freeze / Unfreeze Salary
              </h3>
              <div className="mb-4 flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="freezeMonth" value="Month" />
                  <Select
                    id="freezeMonth"
                    value={month}
                    onChange={(e) => handleMonthYearChange(Number(e.target.value), year)}
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={i + 1}>{name}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="freezeYear" value="Year" />
                  <Select
                    id="freezeYear"
                    value={year}
                    onChange={(e) => handleMonthYearChange(month, Number(e.target.value))}
                  >
                    {currentYearRange().map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-3">
                  <Spinner size="md" />
                </div>
              ) : (
                <>
                  <p
                    className={`mb-4 text-center text-sm ${
                      locked ? "text-amber-600" : "text-gray-500"
                    }`}
                  >
                    {locked
                      ? `Salary for ${MONTH_NAMES[month - 1]} ${year} is frozen — no further changes are allowed.`
                      : `Salary for ${MONTH_NAMES[month - 1]} ${year} is not frozen yet.`}
                  </p>
                  <div className="flex justify-center">
                    {locked ? (
                      <Button color="failure" onClick={() => setStep("otpRequest")}>
                        Unfreeze Salary
                      </Button>
                    ) : (
                      <Button color="warning" onClick={() => setStep("confirmFreeze")}>
                        Freeze Salary
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {step === "confirmFreeze" && (
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
                <Button color="gray" onClick={() => setStep("picker")}>
                  Cancel
                </Button>
                <Button color="warning" onClick={confirmFreeze} isProcessing={freezing} disabled={freezing}>
                  Yes, freeze it
                </Button>
              </div>
            </div>
          )}

          {step === "otpRequest" && (
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Unfreeze salary for {MONTH_NAMES[month - 1]} {year}?
              </h3>
              <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                An OTP will be sent to your registered mobile number to confirm this action.
              </p>
              <div className="flex justify-center gap-3">
                <Button color="gray" onClick={() => setStep("picker")}>
                  Cancel
                </Button>
                <Button color="failure" onClick={requestUnfreeze} isProcessing={unfreezing} disabled={unfreezing}>
                  Send OTP
                </Button>
              </div>
            </div>
          )}

          {step === "otpVerify" && (
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Unfreeze salary for {MONTH_NAMES[month - 1]} {year}?
              </h3>
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
                <Button color="gray" onClick={() => setStep("picker")}>
                  Cancel
                </Button>
                <Button color="failure" onClick={confirmUnfreeze} isProcessing={unfreezing} disabled={unfreezing}>
                  Verify & Unfreeze
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}