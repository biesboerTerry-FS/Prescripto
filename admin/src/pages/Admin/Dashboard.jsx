import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import BarList from "../../components/BarList";
import { LatestBulletin } from "../../components/Announcements";
import PendingOrders from "../../components/PendingOrders";

// Helper that formats a currency amount for display.
const formatMoney = (value) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(value || 0);

// Renders the Stat Card UI.
const StatCard = ({ icon, label, value, hint }) => (
	<div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/80 border rounded-xl border-slate-200 dark:border-slate-700 shadow-sm min-w-60">
		<img className="w-12 h-12 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/40 dark:brightness-150" src={icon} alt="" />
		<div>
			<p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
			<p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
			{hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
		</div>
	</div>
);

// Renders the Status Badge UI.
const StatusBadge = ({ item }) => {
	if (item.cancelled) {
		return (
			<span className="px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/40 rounded-full">
				Cancelled
			</span>
		);
	}
	if (item.payment) {
		return (
			<span className="px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-200 bg-teal-50 dark:bg-teal-900/40 rounded-full">
				Paid
			</span>
		);
	}
	return (
		<span className="px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/40 rounded-full">
			Pending
		</span>
	);
};

// Renders the Dashboard view.
const Dashboard = () => {
	const { dashboard, getDashboard, adminToken, appointments, getAllAppointments } =
		useContext(AdminContext);

	useEffect(() => {
		if (adminToken) {
			getDashboard();
			getAllAppointments();
		}
	}, [adminToken]);

	if (!dashboard) {
		return <div className="m-5 text-sm text-slate-500 dark:text-slate-400">Loading dashboard…</div>;
	}

	return (
		<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
			<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Dashboard</h1>
			<p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
				Overview of doctors, patients and bookings.
			</p>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={assets.doctor_icon}
					label="Doctors"
					value={dashboard.doctors}
					hint={`${dashboard.availableDoctors} available now`}
				/>
				<StatCard
					icon={assets.patients_icon}
					label="Patients"
					value={dashboard.patients}
				/>
				<StatCard
					icon={assets.appointments_icon}
					label="Appointments"
					value={dashboard.appointments}
					hint={`${dashboard.cancelled} cancelled`}
				/>
				<StatCard
					icon={assets.earning_icon}
					label="Booked value"
					value={formatMoney(dashboard.earnings)}
					hint="excludes cancelled bookings"
				/>
			</div>

			<LatestBulletin />

			<PendingOrders appointments={appointments} to="/orders" />

			<div className="grid grid-cols-1 gap-6 mt-8 xl:grid-cols-3">
				<div className="xl:col-span-1">
					<BarList
						title="Bookings by specialty"
						items={dashboard.bySpecialty.map((s) => ({ label: s.specialty, count: s.count }))}
						emptyText="Bookings will appear here once patients book."
					/>
				</div>
				<div className="bg-white dark:bg-slate-800/80 border rounded-xl border-slate-200 dark:border-slate-700 shadow-sm xl:col-span-2">
					<LatestBookings dashboard={dashboard} />
				</div>
			</div>
		</div>
	);
};

const COLUMNS = "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]";

// Renders the Latest Bookings UI.
const LatestBookings = ({ dashboard }) => {
	return (
		<>
			<div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
				<img className="w-5 dark:brightness-150" src={assets.list_icon} alt="" />
				<p className="font-medium text-slate-800 dark:text-slate-100">Latest bookings</p>
			</div>
			{dashboard.latest.length === 0 && (
				<p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">No bookings yet.</p>
			)}
			{dashboard.latest.length > 0 && (
				<>
					<div className={`grid ${COLUMNS} gap-4 px-5 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700`}>
						<span>Patient &amp; doctor</span>
						<span>Date &amp; time</span>
						<span>Status</span>
					</div>
					<ul>
						{dashboard.latest.map((item) => (
							<li
								key={item._id}
								className={`grid ${COLUMNS} items-center gap-4 px-5 py-3 border-b last:border-b-0 border-slate-100 dark:border-slate-700`}
							>
								<div className="flex items-center min-w-0 gap-3">
									<img
										className="object-cover w-10 h-10 rounded-full shrink-0 bg-teal-50 dark:bg-teal-900/40"
										src={item.doctorData.image}
										alt=""
									/>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate text-slate-800 dark:text-slate-100">
											{item.userData.name}
										</p>
										<p className="text-xs truncate text-slate-500 dark:text-slate-400">
											with {item.doctorData.name} · {item.doctorData.specialty}
										</p>
									</div>
								</div>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									{item.slotDate} · {item.slotTime}
								</p>
								<div>
									<StatusBadge item={item} />
								</div>
							</li>
						))}
					</ul>
				</>
			)}
		</>
	);
};

export default Dashboard;
