"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaLock, FaPhoneAlt, FaUser } from "react-icons/fa";
import { HiShieldCheck } from "react-icons/hi";

const API = `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/forgot-password`;

const post = async (path, body) => {
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success, data };
};

const inputCls =
  "py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900";
const labelCls = "block text-sm font-semibold text-white mb-1.5";

const SUBTITLES = {
  mobile: "Enter your username and registered mobile number",
  otp: "Verify your identity",
  password: "Set a new password",
  done: "Password updated",
};

// type: "admin" | "superadmin"
export default function ForgotPassword({ type, onBack, onSuccess }) {
  const [step, setStep] = useState("mobile"); // mobile | otp | password | done
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const run = async (fn) => {
    setError(null);
    setIsLoading(true);
    try {
      await fn();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = () =>
    run(async () => {
      const cleanUsername = username.trim();
      if (!cleanUsername) return setError("Please enter your username");
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return setError("Enter a valid 10-digit mobile number");
      }
      const { ok, data } = await post("send-otp", {
        username: cleanUsername,
        mobile,
        type,
      });
      if (!ok) return setError(data.message || "Failed to send OTP");
      setUsername(cleanUsername);
      setOtp("");
      setStep("otp");
      setCooldown(60);
    });

  const verifyOtp = () =>
    run(async () => {
      if (!/^\d{6}$/.test(otp))
        return setError("Please enter a valid 6-digit OTP");
      const { ok, data } = await post("verify-otp", {
        username,
        mobile,
        otp,
        type,
      });
      if (!ok) return setError(data.message || "Invalid OTP");
      setResetToken(data.data.resetToken);
      setStep("password");
    });

  const resetPassword = () =>
    run(async () => {
      if (newPassword.length < 8)
        return setError("Password must be at least 8 characters");
      if (newPassword !== confirmPassword)
        return setError("Passwords do not match");
      const { ok, data } = await post("reset", {
        resetToken,
        newPassword,
        confirmPassword,
      });
      if (!ok) return setError(data.message || "Failed to reset password");

      if (onSuccess) return onSuccess(data.data);
      setStep("done");
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === "mobile") sendOtp();
    else if (step === "otp") verifyOtp();
    else if (step === "password") resetPassword();
  };

  const buttonLabel = {
    mobile: "Send OTP",
    otp: "Verify OTP",
    password: "Reset Password",
  }[step];

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-no-repeat bg-center bg-cover px-4 py-8"
      style={{
        backgroundImage: `url('/admin-login-bg.jpg')`,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="bg-slate-900/70 backdrop-blur-md p-7 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

        <div className="flex justify-center mb-5">
          <Image
            src="/amp-logo.webp"
            alt="AMP Technology"
            height={56}
            width={56}
            className="rounded-xl"
          />
        </div>

        <div className="text-center mb-7">
          <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
          <p className="text-sm text-gray-300 mt-1">{SUBTITLES[step]}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {step === "done" ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
              Your password has been reset successfully. Please sign in with
              your new password.
            </div>
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            {step === "mobile" && (
              <>
                <div>
                  <label htmlFor="fp-username" className={labelCls}>
                    Username
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      id="fp-username"
                      name="fp-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                      className={`${inputCls} pl-10 pr-4`}
                      placeholder="Enter your username"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fp-mobile" className={labelCls}>
                    Mobile Number
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      id="fp-mobile"
                      name="fp-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, ""))
                      }
                      autoComplete="off"
                      className={`${inputCls} pl-10 pr-4`}
                      placeholder="Enter 10-digit mobile number"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === "otp" && (
              <div>
                <label htmlFor="fp-otp" className={labelCls}>
                  One-Time Password
                </label>
                <div className="relative">
                  <HiShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    id="fp-otp"
                    name="fp-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    autoComplete="one-time-code"
                    className={`${inputCls} pl-10 pr-4 tracking-widest`}
                    placeholder="Enter 6-digit OTP"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  OTP sent to ******{mobile.slice(-4)} for{" "}
                  <span className="font-semibold">{username}</span>
                </p>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={cooldown > 0 || isLoading}
                  className="text-xs text-blue-300 hover:text-blue-200 mt-2 underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {step === "password" && (
              <>
                <div>
                  <label htmlFor="fp-new-password" className={labelCls}>
                    New Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      id="fp-new-password"
                      name="fp-new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      className={`${inputCls} pl-10 pr-11`}
                      placeholder="Min 8 characters"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="fp-confirm-password" className={labelCls}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      id="fp-confirm-password"
                      name="fp-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className={`${inputCls} pl-10 pr-4`}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Please wait..." : buttonLabel}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-blue-300 hover:text-blue-200 underline"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
