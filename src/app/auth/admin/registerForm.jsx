"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterForm() {
	const router = useRouter();

	const [office, setOffice] = useState("");
	const [offices, setOffices] = useState([]);
	const [isOfficeLoading, setIsOfficeLoading] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [mobile, setMobile] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		const fetchOffices = async () => {
			setIsOfficeLoading(true);

			try {
				const backendBaseUrl =
					process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:5000/api";

				const res = await fetch(`${backendBaseUrl}/auth/admin/offices`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});

				const data = await res.json();

				if (res.ok && data.success && Array.isArray(data.data)) {
					setOffices(data.data);

					if (data.data.length > 0) {
						setOffice(data.data[0]._id);
					}
				} else {
					setError(data.message || "Failed to load offices.");
				}
			} catch (fetchError) {
				setError("Failed to load offices. Please refresh and try again.");
			} finally {
				setIsOfficeLoading(false);
			}
		};

		fetchOffices();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccessMessage("");

		if (!office || !username || !password || !mobile) {
			setError("Please fill all required fields");
			return;
		}

		setIsLoading(true);

		try {
			const backendBaseUrl =
				process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:5000/api";

			const res = await fetch(`${backendBaseUrl}/auth/admin/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					office,
					username: username.trim(),
					password,
					mobile: mobile.trim(),
				}),
				credentials: "include",
			});

			const data = await res.json();

			if (res.ok && data.success) {
				setSuccessMessage("Registration successful. Redirecting to login...");
				setTimeout(() => {
					router.push("/auth/admin");
				}, 1000);
			} else {
				setError(data.message || "Registration failed. Please try again.");
			}
		} catch (submitError) {
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
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
				<h2 className="text-2xl font-bold mb-4 text-center">Admin Register</h2>

				{error && (
					<div className="text-red-500 mb-4 text-sm font-medium">{error}</div>
				)}
				{successMessage && (
					<div className="text-green-600 mb-4 text-sm font-medium">
						{successMessage}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="office"
							className="block text-sm font-medium text-gray-700"
						>
							Office
						</label>
						<select
							id="office"
							value={office}
							onChange={(e) => setOffice(e.target.value)}
							className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
							disabled={isOfficeLoading || offices.length === 0}
							required
						>
							{isOfficeLoading && (
								<option value="">Loading offices...</option>
							)}
							{!isOfficeLoading && offices.length === 0 && (
								<option value="">No offices available</option>
							)}
							{!isOfficeLoading && offices.length > 0 &&
								offices.map((officeItem) => (
									<option key={officeItem._id} value={officeItem._id}>
										{officeItem.name}
									</option>
								))}
						</select>
					</div>

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
								{showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
							</button>
						</div>
					</div>

					<div>
						<label
							htmlFor="mobile"
							className="block text-sm font-medium text-gray-700"
						>
							Mobile Number
						</label>
						<input
							id="mobile"
							type="tel"
							value={mobile}
							onChange={(e) => setMobile(e.target.value)}
							className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
							required
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
								Registering...
							</div>
						) : (
							"Register"
						)}
					</button>
				</form>

				<div className="mt-8 text-center">
					<p className="font-medium text-red-500">Facing any issues? Contact:</p>
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
