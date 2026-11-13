import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

// Renders the Login view.
const Login = () => {
	const { backendURL, token, setToken } = useContext(AppContext);
	const navigate = useNavigate();
	const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

	// Helper that handle google success.
	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const { data } = await axios.post(
				`${backendURL}/api/user/oauth-google`,
				{ idToken: credentialResponse.credential }
			);
			if (data.success) {
				localStorage.setItem("token", data.token);
				setToken(data.token);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error("Google sign-in failed");
		}
	};

	// Signs in with a shared demo Google account when real OAuth isn't configured.
	const handleDemoGoogle = async () => {
		try {
			const { data } = await axios.post(
				`${backendURL}/api/user/oauth-google-demo`
			);
			if (data.success) {
				localStorage.setItem("token", data.token);
				setToken(data.token);
			} else {
				toast.error(data.message || "Demo sign-in failed");
			}
		} catch (error) {
			toast.error(
				error?.response?.data?.message || "Demo Google sign-in failed"
			);
		}
	};

	const [state, setState] = useState("Sign Up");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");

	// Helper that on submit handler.
	const onSubmitHandler = async (event) => {
		event.preventDefault();

		try {
			//  ^ if state is Register
			if (state === "Sign Up") {
				const { data } = await axios.post(
					`${backendURL}/api/user/register`,
					{ name, password, email }
				);
				if (data.success) {
					localStorage.setItem("token", data.token);
					setToken(data.token);
				} else {
					toast.error(data.message);
				}
			} else {
				//  ^ if state is login
				const { data } = await axios.post(
					`${backendURL}/api/user/login`,
					{ password, email }
				);
				if (data.success) {
					localStorage.setItem("token", data.token);
					setToken(data.token);
				} else {
					toast.error(data.message);
				}
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	useEffect(() => {
		if (token) {
			navigate("/");
		}
	}, [token]);

	return (
		<>
			<form
				onSubmit={onSubmitHandler}
				className="min-h{80vh] flex items-center"
			>
				<div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
					<p className="text-2xl font-semibold">
						{state === "Sign Up" ? "Create an account." : "Login"}
					</p>
					<p>
						Please {state === "Sign Up" ? "Sign Up" : "Login"} to
						book an appointment.
					</p>
					{state === "Sign Up" && (
						<div className="w-full">
							<label htmlFor="signup-name" className="block">Name</label>
							<input id="signup-name"
								className="w-full p-2 mt-1 border rounded border-zinc-300"
								type="text"
								onChange={(event) =>
									setName(event.target.value)
								}
								value={name}
								required
							/>
						</div>
					)}

					<div className="w-full">
						<label htmlFor="login-email" className="block">Email</label>
						<input id="login-email"
							className="w-full p-2 mt-1 border rounded border-zinc-300"
							type="email"
							onChange={(event) => setEmail(event.target.value)}
							value={email}
							required
						/>
					</div>
					<div className="w-full">
						<label htmlFor="login-password" className="block">Password</label>
						<input id="login-password"
							className="w-full p-2 mt-1 border rounded border-zinc-300"
							type="password"
							onChange={(event) =>
								setPassword(event.target.value)
							}
							value={password}
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full py-2 text-base text-white rounded-md bg-primary"
					>
						{state === "Sign Up" ? "Create an Account" : "Login"}
					</button>
					{googleEnabled ? (
						<>
							<div className="flex items-center w-full gap-3 text-xs text-slate-500">
								<hr className="flex-1 border-slate-200" />
								<span>or</span>
								<hr className="flex-1 border-slate-200" />
							</div>
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={() => toast.error("Google sign-in failed")}
								theme="outline"
								size="large"
							/>
						</>
					) : (
						<>
							<div className="flex items-center w-full gap-3 text-xs text-slate-500">
								<hr className="flex-1 border-slate-200" />
								<span>or</span>
								<hr className="flex-1 border-slate-200" />
							</div>
							<button
								type="button"
								onClick={handleDemoGoogle}
								className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-medium text-slate-700 bg-white border rounded-md border-slate-300 hover:bg-slate-50 transition-colors"
							>
								<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
								</svg>
								Continue with Google (demo)
							</button>
							<p className="w-full text-xs text-center text-slate-500">
								Real Google sign-in isn’t configured, so this signs you into a
								shared demo account to preview the flow.
							</p>
						</>
					)}
					{state === "Sign Up" ? (
						<p>
							Already have an account?{" "}
							<span
								onClick={() => setState("Login")}
								className="underline cursor-pointer text-primary"
							>
								Login here
							</span>
						</p>
					) : (
						<p>
							Create an account.
							<span
								onClick={() => setState("Sign Up")}
								className="underline cursor-pointer text-primary"
							>
								Click here
							</span>
						</p>
					)}
				</div>
			</form>
		</>
	);
};

export default Login;
