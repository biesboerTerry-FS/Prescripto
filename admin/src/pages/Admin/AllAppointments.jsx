import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";

const FILTERS = [
	{ value: "all", label: "All" },
	{ value: "upcoming", label: "Upcoming" },
	{ value: "paid", label: "Paid" },
	{ value: "cancelled", label: "Cancelled" },
];

// Helper that derives a display status from an appointment record.
const statusOf = (item) => {
	if (item.cancelled) return "cancelled";
	if (item.payment) return "paid";
	return "upcoming";
};

// Renders the Status Badge UI.
const StatusBadge = ({ status }) => {
	const styles = {
		cancelled: "text-red-700 bg-red-50",
		paid: "text-teal-700 bg-teal-50",
		upcoming: "text-amber-700 bg-amber-50",
	};
	const labels = {
		cancelled: "Cancelled",
		paid: "Paid",
		upcoming: "Pending",
	};
	return (
		<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
			{labels[status]}
		</span>
	);
};

// Helper that escapes a value for CSV output.
const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

// Helper that export csv.
const exportCsv = (rows) => {
	const header = ["Patient", "Email", "Doctor", "Specialty", "Date", "Time", "Fee (USD)", "Status"];
	const lines = rows.map((item) =>
		[
			item.userData.name,
			item.userData.email,
			item.doctorData.name,
			item.doctorData.specialty,
			item.slotDate,
			item.slotTime,
			item.amount,
			statusOf(item) === "upcoming" ? "Pending" : statusOf(item) === "paid" ? "Paid" : "Cancelled",
		]
			.map(csvCell)
			.join(",")
	);
	const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\r\n")], {
		type: "text/csv;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
	link.click();
	URL.revokeObjectURL(url);
};

// Renders the All Appointments view.
const AllAppointments = () => {
	const { appointments, getAllAppointments, cancelAppointment, adminToken } =
		useContext(AdminContext);
	const [filter, setFilter] = useState("all");
	const [query, setQuery] = useState("");

	useEffect(() => {
		if (adminToken) {
			getAllAppointments();
		}
	}, [adminToken]);

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase();
		return appointments.filter((item) => {
			if (filter !== "all" && statusOf(item) !== filter) return false;
			if (!q) return true;
			return (
				item.userData.name?.toLowerCase().includes(q) ||
				item.doctorData.name?.toLowerCase().includes(q) ||
				item.doctorData.specialty?.toLowerCase().includes(q)
			);
		});
	}, [appointments, filter, query]);

	const counts = useMemo(
		() => ({
			all: appointments.length,
			upcoming: appointments.filter((a) => statusOf(a) === "upcoming").length,
			paid: appointments.filter((a) => statusOf(a) === "paid").length,
			cancelled: appointments.filter((a) => statusOf(a) === "cancelled").length,
		}),
		[appointments]
	);

	return (
		<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
			<h1 className="text-xl font-semibold text-slate-800">Appointments</h1>
			<p className="mb-5 text-sm text-slate-500">
				Every booking across all doctors. Cancelling frees the slot.
			</p>

			<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
				<div className="flex flex-wrap gap-2">
					{FILTERS.map((f) => (
						<button
							key={f.value}
							onClick={() => setFilter(f.value)}
							className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
								filter === f.value
									? "bg-primary text-white border-primary"
									: "bg-white text-slate-600 border-slate-300 hover:border-teal-500 hover:text-teal-700"
							}`}
						>
							{f.label} <span className="font-normal">({counts[f.value]})</span>
						</button>
					))}
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => exportCsv(rows)}
						disabled={rows.length === 0}
						className="px-3 py-2 text-sm font-medium border rounded-lg border-slate-300 bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700 disabled:opacity-50"
					>
						Export CSV
					</button>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					aria-label="Search appointments"
					placeholder="Search patient, doctor or specialty"
					className="w-72 px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:border-teal-500 focus:outline-none"
				/>
				</div>
			</div>

			<div className="overflow-x-auto bg-white border rounded-xl border-slate-200 shadow-sm">
				<table className="w-full text-sm text-left table-fixed">
					<thead className="text-xs uppercase bg-slate-50 text-slate-500">
						<tr>
							<th className="w-[21%] px-4 py-3 font-medium">Patient</th>
							<th className="w-[19%] px-4 py-3 font-medium">Doctor</th>
							<th className="w-[18%] px-4 py-3 font-medium">Date &amp; time</th>
							<th className="w-[10%] px-4 py-3 font-medium">Fee</th>
							<th className="w-[18%] px-4 py-3 font-medium">Status</th>
							<th className="w-[14%] px-4 py-3 font-medium text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((item) => {
							const status = statusOf(item);
							return (
								<tr
									key={item._id}
									className="border-t border-slate-100 hover:bg-slate-50"
								>
									<td className="px-4 py-3">
										<Link to={`/patients/${item.userId}`} className="font-medium text-slate-800 hover:text-teal-700 hover:underline">{item.userData.name}</Link>
										<p className="text-xs text-slate-500">{item.userData.email}</p>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<img
												className="object-cover w-8 h-8 rounded-full bg-teal-50"
												src={item.doctorData.image}
												alt=""
											/>
											<div>
												<p className="text-slate-800">{item.doctorData.name}</p>
												<p className="text-xs text-slate-500">{item.doctorData.specialty}</p>
											</div>
										</div>
									</td>
									<td className="px-4 py-3 text-slate-600">
										{item.slotDate} · {item.slotTime}
									</td>
									<td className="px-4 py-3 text-slate-600">${item.amount}</td>
									<td className="px-4 py-3">
										<StatusBadge status={status} />
									</td>
									<td className="px-4 py-3 text-right">
										{status !== "cancelled" ? (
											<button
												onClick={() => cancelAppointment(item._id)}
												className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-700 hover:text-white transition-colors"
											>
												Cancel
											</button>
										) : (
											<span className="text-xs text-slate-500">—</span>
										)}
									</td>
								</tr>
							);
						})}
						{rows.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-slate-500">
									No appointments match these filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AllAppointments;
