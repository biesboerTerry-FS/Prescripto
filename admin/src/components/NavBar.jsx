import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

// Renders the Nav Bar UI.
const NavBar = () => {
	const { adminToken, setAdminToken } = useContext(AdminContext);
	const navigate = useNavigate();

	// Helper that logout.
	const logout = () => {
		navigate("/");
		localStorage.removeItem("doctorToken");
		adminToken && setAdminToken("");
		adminToken && localStorage.removeItem("adminToken");
	};

	return (
		<div className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b bg-white px-4 py-3 sm:px-10">
			<div className="flex items-center gap-2 text-xs">
				<img
					onClick={() => navigate("/")}
					className="brand-logo cursor-pointer w-36 sm:w-40"
					src={assets.admin_logo}
					alt=""
				/>
				<p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
					{adminToken ? "Admin" : "Doctor"}
				</p>
			</div>
			<div className="flex items-center gap-3">
			<ThemeToggle />
			<button
				onClick={logout}
				className="px-10 py-2 text-sm text-white rounded-full bg-primary"
			>
				Logout
			</button>
			</div>
		</div>
	);
};

export default NavBar;
