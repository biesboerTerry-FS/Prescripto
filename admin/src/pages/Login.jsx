import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { toast } from "react-toastify";
import api, { getApiErrorMessage } from "../lib/api";

const DEMO_DOCTOR = {
	email: "richard.james@prescripto.com",
	password: "Demo123456",
};

// Renders the Login view for both admins and doctors/staff.
const Login = () => {
	const navigate = useNavigate();
	const [state, setState] = useState("Admin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const { setAdminToken } = useContext(AdminContext);
	const { loginDoctor } = useContext(DoctorContext);

	// Shared demo sign-in for the scoped staff self-service portal.
	const signInAsDemoStaff = async () => {
		setSubmitting(true);
		const result = await loginDoctor(DEMO_DOCTOR.email, DEMO_DOCTOR.password);
		setSubmitting(false);
		if (result.success) {
			toast.success(result.local ? "Demo staff session (offline) started!" : "Demo staff login successful!");
			navigate("/staff");
		} else {
			toast.error(result.message);
		}
	};

	// Demo admin login for portfolio visitors (dev/demo account).
	const handleDemoAdminLogin = async () => {
		try {
			const { data } = await api.post(
				"/admin/login",
				{ email: "demo-admin@prescripto.com", password: "DemoAdmin123!" },
				{ skipAuthRedirect: true }
			);
			if (data.success) {
				localStorage.setItem("adminToken", data.token);
				localStorage.removeItem("doctorToken");
				setAdminToken(data.token);
				toast.success("Demo admin login successful!");
			} else {
				toast.error(data.message || "Demo admin login failed.");
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Demo admin login failed."));
		}
	};

	// Helper that on submit handler.
	const onSubmitHandler = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			if (state === "Admin") {
				const { data } = await api.post(
					"/admin/login",
					{ email, password },
					{ skipAuthRedirect: true }
				);
				if (data.success) {
					localStorage.setItem("adminToken", data.token);
					localStorage.removeItem("doctorToken");
					setAdminToken(data.token);
					toast.success("Login successful!");
				} else {
					toast.error(data.message);
				}
			} else {
				const result = await loginDoctor(email, password);
				if (result.success) {
					toast.success("Doctor login successful!");
					navigate("/staff");
				} else {
					toast.error(result.message);
				}
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Login failed."));
		} finally {
			setSubmitting(false);
		}
	};

	// Switching roles clears the fields so credentials don't bleed across.
	const switchRole = (role) => {
		setState(role);
		setEmail("");
		setPassword("");
	};

	return (
		<form
			onSubmit={onSubmitHandler}
			className="flex items-center justify-center min-h-screen"
		>
			<div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5e5e5e] text-sm shadow-lg">
				<p className="m-auto text-2xl font-semibold">
					<span className="text-primary">{state} </span>
					Login
				</p>
				<div className="w-full">
					<label htmlFor="staff-email" className="block">Email</label>
					<input id="staff-email"
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						className="border border-[#dadada] rounded w-full p-2 mt-1"
						type="email"
						placeholder={state === "Doctor" ? DEMO_DOCTOR.email : undefined}
						required
					/>
				</div>
				<div className="w-full">
					<label htmlFor="staff-password" className="block">Password</label>
					<input id="staff-password"
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						className="border border-[#dadada] rounded w-full p-2 mt-1"
						type="password"
						placeholder={state === "Doctor" ? DEMO_DOCTOR.password : undefined}
						required
					/>
				</div>
				<button
					disabled={submitting}
					className="w-full py-2 text-base text-white rounded-md bg-primary disabled:opacity-60"
				>
					{submitting ? "Signing in…" : "Login"}
				</button>
				{state === "Admin" ? (
					<>
						<button
							type="button"
							onClick={signInAsDemoStaff}
							disabled={submitting}
							className="w-full py-2 text-base font-medium transition-colors border rounded-md text-primary border-primary hover:bg-primary/5 disabled:opacity-60"
						>
							Try demo staff
						</button>
						<button
							type="button"
							onClick={handleDemoAdminLogin}
							className="w-full py-2 text-base font-medium transition-colors border rounded-md text-primary border-primary hover:bg-primary/5"
						>
							Sign in as demo admin
						</button>
					</>
				) : (
					<button
						type="button"
						onClick={signInAsDemoStaff}
						disabled={submitting}
						className="w-full py-2 text-base font-medium transition-colors border rounded-md text-primary border-primary hover:bg-primary/5 disabled:opacity-60"
					>
						Try demo doctor
					</button>
				)}
				{state === "Admin" ? (
					<p>
						Doctor login?
						<span
							className="underline cursor-pointer text-primary"
							onClick={() => switchRole("Doctor")}
						>
							Click here
						</span>
					</p>
				) : (
					<p>
						Admin login?
						<span
							className="underline cursor-pointer text-primary"
							onClick={() => switchRole("Admin")}
						>
							Click here
						</span>
					</p>
				)}
			</div>
		</form>
	);
};

export default Login;
