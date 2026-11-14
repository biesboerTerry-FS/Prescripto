import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import ThemeToggle from "./ThemeToggle";

// Renders the Nav Bar UI.
const NavBar = () => {
	const navigate = useNavigate();
	const [showMenu, setShowMenu] = useState(false);
	const { token, setToken, userData } = useContext(AppContext);
	// Helper that logout.
	const logout = () => {
		setToken("false");
		localStorage.removeItem("token");
	};

	return (
		<>
			<div className="sticky top-0 z-30 w-full px-4 sm:px-[10%] bg-[#f8fafc]/95 backdrop-blur border-b border-slate-200 shadow-sm flex items-center justify-between py-4 text-sm">
				<img
					onClick={() => navigate("/")}
					className="brand-logo cursor-pointer w-44"
					src={assets.logo}
					alt=""
				/>
				<ul className="items-start hidden gap-5 font-medium md:flex">
					<li><NavLink to="/"><span className="block py-1">HOME</span><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink></li>
					<li><NavLink to="/doctors"><span className="block py-1">DOCTORS</span><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink></li>
					<li><NavLink to="/about"><span className="block py-1">ABOUT</span><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink></li>
					<li><NavLink to="/contact"><span className="block py-1">CONTACT</span><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink></li>
				</ul>

				<div className="flex items-center gap-4">
					{token && userData ? (
						<div className="relative flex items-center gap-2 cursor-pointer group rounded-full p-1 pr-2 border border-transparent transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600">
							<img
								className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 bg-slate-100 dark:border-teal-400/70 dark:bg-slate-700"
								src={userData.image}
								alt=""
							/>
							<img
								className="w-2.5 opacity-70 transition-opacity group-hover:opacity-100 dark:invert"
								src={assets.dropdown_icon}
								alt=""
							/>
							<div className="absolute top-0 right-0 z-20 hidden text-base font-medium text-gray-600 pt-14 group-hover:block">
								<div className="flex flex-col gap-4 p-4 rounded min-w-48 bg-stone-100">
									<p
										onClick={() => navigate("/my-profile")}
										className="cursor-pointer hover:text-teal-700 dark:hover:text-white"
									>
										My Profile
									</p>
									<p
										onClick={() => navigate("/my-appointments")}
										className="cursor-pointer hover:text-teal-700 dark:hover:text-white"
									>
										My Appointments
									</p>
									<p
										onClick={logout}
										className="cursor-pointer hover:text-teal-700 dark:hover:text-white"
									>
										Logout
									</p>
								</div>
							</div>
						</div>
					) : (
						<button
							onClick={() => navigate("/login")}
							className="hidden px-8 py-3 font-light text-white rounded-full bg-primary md:block"
						>
							Create Account
						</button>
					)}
					<ThemeToggle />
					<button
						type="button"
						onClick={() => setShowMenu(true)}
						aria-label="Open menu"
						aria-expanded={showMenu}
						className="md:hidden"
					>
						<img className="w-6" src={assets.menu_icon} alt="" />
					</button>
				</div>
			</div>

			{/* mobile menu — rendered as a fixed sibling so it covers the full viewport */}
			<div
				className={`fixed inset-0 z-40 bg-white md:hidden ${
					showMenu ? "block" : "hidden"
				}`}
			>
				<div className="flex items-center justify-between px-5 py-6">
					<img className="brand-logo w-36" src={assets.logo} alt="" />
					<button
						type="button"
						onClick={() => setShowMenu(false)}
						aria-label="Close menu"
					>
						<img className="w-7" src={assets.cross_icon} alt="" />
					</button>
				</div>
				<ul className="flex flex-col items-center gap-2 px-5 mt-5 text-lg font-medium">
					<li><NavLink onClick={() => setShowMenu(false)} to="/"><p className="inline-block px-4 py-2 rounded">HOME</p></NavLink></li>
					<li><NavLink onClick={() => setShowMenu(false)} to="/doctors"><p className="inline-block px-4 py-2 rounded">DOCTORS</p></NavLink></li>
					<li><NavLink onClick={() => setShowMenu(false)} to="/about"><p className="inline-block px-4 py-2 rounded">ABOUT</p></NavLink></li>
					<li><NavLink onClick={() => setShowMenu(false)} to="/contact"><p className="inline-block px-4 py-2 rounded">CONTACT</p></NavLink></li>
				</ul>
			</div>
		</>
	);
};

export default NavBar;
