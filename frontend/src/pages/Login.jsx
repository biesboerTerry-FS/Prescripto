import React, { useContext, useEffect, useState } from "react";
import { SignIn } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import api, { getApiErrorMessage } from "../lib/api";

// Patient/public sign-in is powered by Clerk. Admin and doctor logins live in
// their own apps and are intentionally untouched.
const Login = () => {
	const { token, setToken } = useContext(AppContext);
	const navigate = useNavigate();
	const [demoLoading, setDemoLoading] = useState(false);

	// Clearly-labeled demo path for portfolio visitors who don't want a Clerk
	// account. This is not the primary patient sign-in.
	const handleDemoLogin = async () => {
		setDemoLoading(true);
		try {
			const { data } = await api.post(
				"/user/login",
				{ email: "demo@prescripto.com", password: "Demo123456" },
				{ skipAuthRedirect: true }
			);
			if (data.success) {
				localStorage.setItem("token", data.token);
				setToken(data.token);
			} else {
				toast.error(data.message || "Demo sign-in failed.");
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Demo sign-in failed."));
		} finally {
			setDemoLoading(false);
		}
	};

	useEffect(() => {
		if (token) {
			navigate("/");
		}
	}, [token, navigate]);

	return (
		<div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 py-10">
			<div className="w-full max-w-md">
				<SignIn routing="hash" />
			</div>

			<div className="w-full max-w-md px-6 py-5 border rounded-xl text-zinc-600 text-sm shadow-sm bg-white">
				<p className="font-semibold text-zinc-700">Just exploring?</p>
				<p className="mt-1 text-xs text-slate-500">
					Use the demo patient account — no Clerk account required.
				</p>
				<button
					type="button"
					onClick={handleDemoLogin}
					disabled={demoLoading}
					className="w-full mt-3 py-2 text-sm font-medium transition-colors border rounded-md text-primary border-primary hover:bg-primary/5 disabled:opacity-60"
				>
					{demoLoading ? "Signing in…" : "Enter demo patient account"}
				</button>
			</div>
		</div>
	);
};

export default Login;
