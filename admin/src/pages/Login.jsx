import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import api, { getApiErrorMessage } from "../lib/api";

// Renders the Login view.
const Login = () => {
	const [state, setState] = useState("Admin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { setAdminToken } = useContext(AdminContext);

	// Helper that on submit handler.
	const onSubmitHandler = async (e) => {
		e.preventDefault();

		try {
			if (state === "Admin") {
				const { data } = await api.post(
					"/admin/login",
					{ email, password },
					{ skipAuthRedirect: true }
				);
				if (data.success) {
					localStorage.setItem("adminToken", data.token);
					setAdminToken(data.token);
					toast.success("Login successful!");
				} else {
					toast.error(data.message);
				}
			} else {
				toast.error("Doctor login is not available yet.");
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Admin login failed."));
		}
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
					<label htmlFor="admin-email" className="block">Email</label>
					<input id="admin-email"
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						className="border border-[#dadada] rounded w-full p-2 mt-1"
						type="email"
						required
					/>
				</div>
				<div className="w-full">
					<label htmlFor="admin-password" className="block">Password</label>
					<input id="admin-password"
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						className="border border-[#dadada] rounded w-full p-2 mt-1"
						type="password"
						required
					/>
				</div>
				<button className="w-full py-2 text-base text-white rounded-md bg-primary">
					Login
				</button>
				{state === "Admin" ? (
					<p>
						Doctor login?
						<span
							className="underline cursor-pointer text-primary"
							onClick={() => setState("Doctor")}
						>
							Click here
						</span>
					</p>
				) : (
					<p>
						Admin login?
						<span
							className="underline cursor-pointer text-primary"
							onClick={() => setState("Admin")}
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
