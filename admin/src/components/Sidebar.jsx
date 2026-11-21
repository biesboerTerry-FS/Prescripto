import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

// Shared link styling: a soft active highlight plus an accent bar, no dividers.
const linkClass = ({ isActive }) =>
	`flex items-center gap-3 border-l-4 py-3.5 pl-3 pr-3 md:pl-9 ${
		isActive ? "sidebar-link-active border-primary bg-teal-50" : "border-transparent"
	} cursor-pointer`;

// Renders the Sidebar UI.
const Sidebar = () => {
	const { adminToken } = useContext(AdminContext);
	// All categories start collapsed; the user opts in to each group.
	const [expanded, setExpanded] = useState({
		workspace: false,
		communication: false,
		hr: false,
	});

	const toggle = (key) => {
		setExpanded((current) => ({ ...current, [key]: !current[key] }));
	};

	// Category headers are buttons, not links, and default to expanded.
	const category = (key, label, testId) => (
		<li>
			<button
				type="button"
				onClick={() => toggle(key)}
				aria-expanded={expanded[key]}
				data-testid={testId ? `sidebar-category-${testId}` : undefined}
				className="flex w-full items-center gap-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-primary"
			>
				<span className="sidebar-category-label" data-testid={testId}>
					{label}
				</span>
				<span
					aria-hidden="true"
					className={`ml-auto text-[10px] transition-transform ${expanded[key] ? "" : "-rotate-90"}`}
				>
					▾
				</span>
			</button>
		</li>
	);

	const item = (to, label, icon, testId) => (
		<li key={to}>
			<NavLink className={linkClass} to={to} data-testid={testId}>
				<img src={icon} alt="" className="sidebar-icon h-5 w-5 shrink-0 object-contain" />
				<p>{label}</p>
			</NavLink>
		</li>
	);

	return (
		<div
			className="sticky top-0 h-full shrink-0 self-start overflow-y-auto bg-white"
			data-testid="admin-sidebar"
		>
			{adminToken && (
				<nav>
					<ul className="mt-5 pb-10 text-primary">
						{item("/admin-dashboard", "Dashboard", assets.home_icon)}
						{item("/all-appointments", "Appointments", assets.appointment_icon)}
						{item("/patients", "Patients", assets.patient_icon)}
						{item("/add-doctor", "Add Doctor", assets.add_icon)}
						{item("/doctor-list", "Doctor List", assets.people_icon)}

						{category("workspace", "Workspace", "workspace")}
						{expanded.workspace && [
							item("/orders", "Orders", assets.list_icon),
							item("/messages", "Messages", assets.announcement_icon),
							item("/schedule", "Schedule", assets.appointment_icon),
						]}

						{category("communication", "Communication", "communication")}
						{expanded.communication && item("/announcements", "Announcements", assets.announcement_icon)}

						{category("hr", "HR", "hr-nav-group")}
						{expanded.hr && [
							item("/hr/directory", "Staff directory", assets.people_icon, "hr-nav-directory"),
							item("/hr/manage", "Staff management", assets.add_icon, "hr-nav-manage"),
							item("/hr/departments", "Roles & departments", assets.list_icon, "hr-nav-departments"),
							item("/hr/payroll", "Payroll", assets.money_icon, "hr-nav-payroll"),
							item("/hr/time-off", "Time-off approvals", assets.appointment_icon, "hr-nav-time-off"),
							item("/hr/performance", "Performance notes", assets.note_icon, "hr-nav-performance"),
						]}
					</ul>
				</nav>
			)}
		</div>
	);
};

export default Sidebar;
