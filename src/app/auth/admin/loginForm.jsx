"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { HiShieldCheck } from "react-icons/hi";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileStatus, setTurnstileStatus] = useState("required");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("password");

  // Chrome/Edge autofill block trick — input readOnly রাখা হয়, focus হলে readOnly সরিয়ে দেওয়া হয়
  const [usernameReadOnly, setUsernameReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (step === "password") {
      if (!username || !password) {
        setError("Please enter both username and password");
        setIsLoading(false);
        return;
      }

      if (turnstileStatus !== "success") {
        setError("Please verify you are not a robot");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/admin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include",
          }
        );

        const data = await res.json();

        if (data.success) {
          setStep("otp");
          setError(null);
        } else {
          setError("Invalid username or password");
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (step === "otp") {
      if (!otp) {
        setError("Please enter OTP");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/admin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, otp }),
            credentials: "include",
          }
        );

        const data = await res.json();

        if (data.success) {
          router.push("/dashboard");
        } else {
          setError(data.message || "Invalid OTP");
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-no-repeat bg-center bg-cover px-4 py-8"
      style={{
        backgroundImage: `url('/admin-login-bg.jpg')`,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="bg-white/98 backdrop-blur-sm p-7 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

        {/* Logo */}
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
          <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
          <p className="text-sm text-white mt-1">
            {step === "password"
              ? "Sign in to your account"
              : "Verify your identity"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-5">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* autoComplete="off" form-level + fake hidden fields Chrome-কে confuse করার জন্য */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          autoComplete="off"
        >
          {/* Chrome/Safari autofill কে confuse করার জন্য hidden dummy fields */}
          <input type="text" name="fake-username" className="hidden" tabIndex={-1} autoComplete="off" />
          <input type="password" name="fake-password" className="hidden" tabIndex={-1} autoComplete="off" />

          {step === "password" && (
            <>
              <div>
                <label
                  htmlFor="admin-username-field"
                  className="block text-sm font-semibold text-white mb-1.5"
                >
                  Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="admin-username-field"
                    name="admin-username-field"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    readOnly={usernameReadOnly}
                    onFocus={() => setUsernameReadOnly(false)}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password-field"
                  className="block text-sm font-semibold text-white mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="admin-password-field"
                    name="admin-password-field"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    readOnly={passwordReadOnly}
                    onFocus={() => setPasswordReadOnly(false)}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    className="pl-10 pr-11 py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "otp" && (
            <div>
              <label
                htmlFor="admin-otp-field"
                className="block text-sm font-semibold text-white mb-1.5"
              >
                One-Time Password
              </label>
              <div className="relative">
                <HiShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  id="admin-otp-field"
                  name="admin-otp-field"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoComplete="one-time-code"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 tracking-widest"
                  placeholder="Enter 6-digit OTP"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-white mt-2">
                OTP sent to your registered mobile number.
              </p>
            </div>
          )}

          <div className="flex justify-center pt-1">
            <Turnstile
              siteKey={
                process.env.NODE_ENV === "production"
                  ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
                  : "1x00000000000000000000AA"
              }
              options={{ theme: "light", size: "flexible" }}
              onError={() => {
                setTurnstileStatus("error");
                setError("Security check failed. Please try again.");
              }}
              onExpire={() => {
                setTurnstileStatus("expired");
                setError("Security check expired. Please verify again.");
              }}
              onWidgetLoad={() => {
                setTurnstileStatus("required");
                setError(null);
              }}
              onSuccess={() => {
                setTurnstileStatus("success");
                setError(null);
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {step === "password" ? "Signing in..." : "Verifying..."}
              </div>
            ) : step === "password" ? (
              "Sign In"
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        {/* Footer Help Section */}
        <div className="mt-7 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-white mb-1">Facing any issues?</p>
          <a
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
            href="tel:8697972001"
          >
            📞 8697972001
          </a>
        </div>
      </div>
    </div>
  );
}