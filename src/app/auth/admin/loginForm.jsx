"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
        console.log(data);

        if (data.success) {
          setStep("otp"); // move to OTP step
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
      className="flex justify-center items-center min-h-screen bg-no-repeat bg-center bg-cover px-4"
      style={{
        backgroundImage: `url('/admin-login-bg.jpg')`,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="bg-white/95 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

        {error && (
          <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "password" && (
            <>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 w-full border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <FaEye size={20} />
                    ) : (
                      <FaEyeSlash size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "otp" && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                OTP sent to your registered mobile number.
              </p>
            </div>
          )}

          <div className="flex justify-center">
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
            className="w-full bg-blue-500 text-white p-2 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 
                       0 0 5.373 0 12h4zm2 
                       5.291A7.962 7.962 0 
                       014 12H0c0 
                       3.042 1.135 5.824 3 
                       7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer Help Section */}
        <div className="mt-8 text-center">
          <p className="font-medium text-red-500">
            Facing any issues? Contact:
          </p>
          <a
            className="text-lg font-semibold text-blue-600 underline"
            href="tel:8697972001"
          >
            8697972001
          </a>
        </div>

        <Image
          className="mx-auto mt-6"
          src="/amp-logo.webp"
          alt="amp_technology_logo"
          height={100}
          width={80}
        />
      </div>
    </div>
  );
}
