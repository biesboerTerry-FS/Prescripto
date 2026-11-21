import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

// Renders the Sidebar UI.
const Sidebar = () => {
	const { adminToken } = useContext(AdminContext);

	return (
		<div className="min-h-screen bg-white border-r">
			{adminToken && (
				<ul className="text-primary mt-5">
					<li>
						<NavLink
						className={({ isActive }) =>
							`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
								isActive
									? "bg-teal-50 border-r-4 border-primary"
									: ""
							}`
						}
						to={"/admin-dashboard"}
					>
						<img src={assets.home_icon} alt="" />
						<p>Dashboard</p>
						</NavLink>
					</li>
					<li>
						<NavLink
						className={({ isActive }) =>
							`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
								isActive
									? "bg-teal-50 border-r-4 border-primary"
									: ""
							}`
						}
						to={"/all-appointments"}
					>
						<img src={assets.appointment_icon} alt="" />
						<p>Appointments</p>
						</NavLink>
					</li>
					<li>
						<NavLink
						className={({ isActive }) =>
							`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
								isActive
									? "bg-teal-50 border-r-4 border-primary"
									: ""
							}`
						}
						to={"/patients"}
					>
						<img src={assets.patient_icon} alt="" />
						<p>Patients</p>
						</NavLink>
					</li>
					<li>
						<NavLink
						className={({ isActive }) =>
							`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
								isActive
									? "bg-teal-50 border-r-4 border-primary"
									: ""
							}`
						}
						to={"/add-doctor"}
					>
						<img src={assets.add_icon} alt="" />
						<p>Add Doctor</p>
						</NavLink>
					</li>
					<li>
						<NavLink
						className={({ isActive }) =>
							`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
								isActive
									? "bg-teal-50 border-r-4 border-primary"
									: ""
							}`
						}
						to={"/doctor-list"}
					>
						<img src={assets.people_icon} alt="" />
						<p>Doctor List</p>
						</NavLink>
					</li>
					<li className="mt-4 pt-3 border-t border-slate-100">
						<p className="px-3 md:px-9 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
							Workspace
						</p>
					</li>
					{[
						["/orders", "Orders", assets.list_icon],
						["/messages", "Messages", assets.announcement_icon],
						["/schedule", "Schedule", assets.appointment_icon],
					].map(([to, label, icon]) => (
						<li key={to}>
							<NavLink
								className={({ isActive }) =>
									`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
										isActive ? "bg-teal-50 border-r-4 border-primary" : ""
									}`
								}
								to={to}
							>
								<img src={icon} alt="" />
								<p>{label}</p>
							</NavLink>
						</li>
					))}
					<li className="mt-4 pt-3 border-t border-slate-100">
						<p className="px-3 md:px-9 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
							Communication
						</p>
					</li>
					<li>
						<NavLink
						className={({ isActive }) =>
							`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
								isActive
									? "bg-teal-50 border-r-4 border-primary"
									: ""
							}`
						}
						to={"/announcements"}
					>
						<img src={assets.announcement_icon} alt="" />
						<p>Announcements</p>
						</NavLink>
					</li>
				</ul>
			)}
		</div>
	);
};

export default Sidebar;
