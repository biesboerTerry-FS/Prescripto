import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import PendingOrders from "../../components/PendingOrders";
import OrdersPanel from "../../components/OrdersPanel";
import MessagesPanel from "../../components/MessagesPanel";
import SchedulePanel from "../../components/SchedulePanel";

const STAFF_TABS = [
	["home", "My profile"],
	["orders", "Orders"],
	["messages", "Messages"],
	["schedule", "Schedule"],
];

const formatAddress = (address) => {
	if (!address) return "Not provided";
	if (typeof address === "string") return address;
	return [address.line1, address.line2].filter(Boolean).join(", ") || "Not provided";
};

// A deliberately scoped self-service view: only the signed-in staff member's
// own basic details, availability and upcoming appointments. No admin data.
const StaffPortal = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = STAFF_TABS.some(([key]) => key === searchParams.get("tab"))
		? searchParams.get("tab")
		: "home";
	const {
		doctor,
		appointments,
		loadDoctorData,
		logoutDoctor,
		setAvailability,
		updateDoctorProfile,
	} = React.useContext(DoctorContext);

	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		line1: "",
		line2: "",
	});

	useEffect(() => {
		if (doctor) {
			setForm({
				name: doctor.name || "",
				email: doctor.email || "",
				phone: doctor.phone || "",
				line1: doctor.address?.line1 || "",
				line2: doctor.address?.line2 || "",
			});
		}
	}, [doctor]);

	const logout = () => {
		logoutDoctor();
		navigate("/");
	};

	const toggleAvailability = async () => {
		const result = await setAvailability(!doctor?.available);
		if (result.success) toast.success(result.message);
		else toast.error(result.message);
	};

	const changeField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

	const saveDetails = async (event) => {
		event.preventDefault();
		setSaving(true);
		const result = await updateDoctorProfile({
			name: form.name,
			email: form.email,
			phone: form.phone,
			address: { line1: form.line1, line2: form.line2 },
		});
		setSaving(false);
		if (result.success) {
			setEditing(false);
			toast.success(result.message);
		} else {
			toast.error(result.message);
		}
	};

	const upcoming = (appointments || []).filter((item) => !item.cancelled).slice(0, 5);
	const initials = (doctor?.name || "Staff")
		.split(" ")
		.filter((part) => !part.toLowerCase().startsWith("dr."))
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="min-h-screen bg-[#f8f9fd]">
			<div className="flex items-center justify-between border-b bg-white px-4 py-3 sm:px-10">
				<div className="flex items-center gap-3">
					<img className="brand-logo w-36 sm:w-40" src={assets.admin_logo} alt="Prescripto" />
					<span className="rounded-full border border-gray-500 px-2.5 py-0.5 text-xs text-gray-600">
						Staff Portal
					</span>
				</div>
				<button
					onClick={logout}
					className="rounded-full bg-primary px-8 py-2 text-sm text-white"
				>
					Logout
				</button>
			</div>

			<main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
				<header className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-800">My staff profile</h1>
					<p className="mt-1 text-sm text-slate-500">
						Your own details only — administrative data is not available here.
					</p>
				</header>

				<nav className="flex flex-wrap gap-2 mb-6" aria-label="Staff portal sections">
					{STAFF_TABS.map(([key, label]) => (
						<button
							key={key}
							type="button"
							onClick={() => setSearchParams({ tab: key })}
							aria-current={tab === key ? "page" : undefined}
							className={`px-4 py-2 text-sm font-medium rounded-full ${
								tab === key
									? "bg-primary text-white"
									: "border border-slate-300 text-slate-600 hover:bg-slate-50"
							}`}
						>
							{label}
						</button>
					))}
				</nav>

				{tab === "home" && (
				<>
				<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
						{doctor?.image ? (
							<img
								className="h-20 w-20 rounded-full bg-slate-100 object-cover"
								src={doctor.image}
								alt=""
							/>
						) : (
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
								{initials}
							</div>
						)}
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-slate-800" data-testid="staff-name">
								{doctor?.name || "Staff member"}
							</h2>
							<p className="mt-1 text-sm text-slate-500">
								<span className="font-medium">Role:</span> Doctor ·{" "}
								<span className="font-medium">Specialization:</span>{" "}
								{doctor?.specialty || "Not provided"}
							</p>
							{(doctor?.degree || doctor?.experience) && (
								<p className="mt-0.5 text-xs text-slate-500">
									{[doctor?.degree, doctor?.experience && `${doctor.experience} experience`]
										.filter(Boolean)
										.join(" · ")}
								</p>
							)}
						</div>
						<button
							onClick={toggleAvailability}
							className={`rounded-full px-5 py-2 text-sm font-medium text-white ${
								doctor?.available
									? "bg-teal-600 hover:bg-teal-700"
									: "bg-slate-500 hover:bg-slate-600"
							}`}
						>
							{doctor?.available ? "Available for bookings" : "Currently unavailable"}
						</button>
					</div>

					<dl className="mt-6 grid gap-4 border-t pt-6 text-sm sm:grid-cols-2">
						<div>
							<dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
							<dd className="mt-1 text-slate-800" data-testid="staff-email">
								{doctor?.email || "Not provided"}
							</dd>
						</div>
						<div>
							<dt className="text-xs uppercase tracking-wide text-slate-500">Phone</dt>
							<dd className="mt-1 text-slate-800" data-testid="staff-phone">
								{doctor?.phone || "Not provided"}
							</dd>
						</div>
						<div className="sm:col-span-2">
							<dt className="text-xs uppercase tracking-wide text-slate-500">Address</dt>
							<dd className="mt-1 text-slate-800" data-testid="staff-address">
								{formatAddress(doctor?.address)}
							</dd>
						</div>
					</dl>

					<div className="mt-6 border-t pt-6">
						{!editing ? (
							<button
								onClick={() => setEditing(true)}
								className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
							>
								Edit my details
							</button>
						) : (
							<form onSubmit={saveDetails} className="grid gap-4 sm:grid-cols-2">
								{[
									["name", "Full name"],
									["email", "Email"],
									["phone", "Phone"],
									["line1", "Address line 1"],
									["line2", "Address line 2"],
								].map(([key, label]) => (
									<label key={key} className="block text-sm">
										<span className="text-slate-600">{label}</span>
										<input
											aria-label={label}
											value={form[key]}
											onChange={(event) => changeField(key, event.target.value)}
											className="mt-1 w-full rounded border border-[#dadada] p-2"
											required={key === "name" || key === "email"}
										/>
									</label>
								))}
								<div className="flex gap-3 sm:col-span-2">
									<button
										type="submit"
										disabled={saving}
										className="rounded-md bg-primary px-5 py-2 text-sm text-white disabled:opacity-60"
									>
										{saving ? "Saving…" : "Save changes"}
									</button>
									<button
										type="button"
										onClick={() => setEditing(false)}
										className="rounded-md border border-slate-300 px-5 py-2 text-sm text-slate-600"
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				</section>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-800">My upcoming appointments</h2>
						<button
							onClick={loadDoctorData}
							className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
						>
							Refresh
						</button>
					</div>
					<ul className="mt-4 divide-y">
						{upcoming.map((item, index) => (
							<li key={item._id || index} className="flex items-center justify-between py-3 text-sm">
								<span className="text-slate-700">
									{item.slotDate} · {item.slotTime}
								</span>
								<span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
									{item.payment ? "Confirmed" : "Scheduled"}
								</span>
							</li>
						))}
						{upcoming.length === 0 && (
							<li className="py-6 text-center text-sm text-slate-500">
								No upcoming appointments scheduled.
							</li>
						)}
					</ul>
				</section>

				<PendingOrders
					appointments={appointments}
					to="/staff?tab=orders"
					title="Pending orders"
				/>
				</>
				)}

				{tab === "orders" && (
					<OrdersPanel role="staff" appointments={appointments} />
				)}
				{tab === "messages" && (
					<MessagesPanel role="staff" senderName={doctor?.name || "Staff member"} />
				)}
				{tab === "schedule" && (
					<SchedulePanel
						role="staff"
						appointments={appointments}
						availability={Boolean(doctor?.available)}
						onToggleAvailability={toggleAvailability}
						requesterName={doctor?.name || "Staff member"}
					/>
				)}
			</main>
		</div>
	);
};

export default StaffPortal;
