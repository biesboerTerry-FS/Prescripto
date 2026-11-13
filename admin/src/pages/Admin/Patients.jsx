import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";

// Helper that formats a join/creation date for display.
const formatJoined = (id) => {
	// Mongo ObjectIds embed their creation time
	const seconds = parseInt(id.substring(0, 8), 16);
	return new Date(seconds * 1000).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

// Renders the Patients view.
const Patients = () => {
	const { patients, getPatients, adminToken } = useContext(AdminContext);
	const [query, setQuery] = useState("");

	useEffect(() => {
		if (adminToken) {
			getPatients();
		}
	}, [adminToken]);

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return patients;
		return patients.filter(
			(p) =>
				p.name?.toLowerCase().includes(q) ||
				p.email?.toLowerCase().includes(q) ||
				p.phone?.toLowerCase().includes(q)
		);
	}, [patients, query]);

	return (
		<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
			<div className="flex flex-wrap items-end justify-between gap-3 mb-5">
				<div>
					<h1 className="text-xl font-semibold text-slate-800">Patients</h1>
					<p className="text-sm text-slate-500">
						{patients.length} registered. Select a patient to see their history.
					</p>
				</div>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					aria-label="Search patients"
					placeholder="Search name, email or phone"
					className="w-72 px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 focus:border-teal-500 focus:outline-none"
				/>
			</div>

			<div className="overflow-x-auto bg-white border rounded-xl border-slate-200 shadow-sm">
				<table className="w-full text-sm text-left">
					<thead className="text-xs uppercase bg-slate-50 text-slate-500">
						<tr>
							<th className="px-4 py-3 font-medium">Patient</th>
							<th className="px-4 py-3 font-medium">Phone</th>
							<th className="px-4 py-3 font-medium">Gender</th>
							<th className="px-4 py-3 font-medium">Bookings</th>
							<th className="px-4 py-3 font-medium">Joined</th>
							<th className="px-4 py-3 font-medium text-right"> </th>
						</tr>
					</thead>
					<tbody>
						{rows.map((p) => (
							<tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50">
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<span className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
											{p.name?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
										</span>
										<div>
											<p className="font-medium text-slate-800">{p.name}</p>
											<p className="text-xs text-slate-500">{p.email}</p>
										</div>
									</div>
								</td>
								<td className="px-4 py-3 text-slate-600">{p.phone}</td>
								<td className="px-4 py-3 text-slate-600">{p.gender}</td>
								<td className="px-4 py-3 text-slate-600">
									{p.bookings}
									{p.activeBookings > 0 && (
										<span className="ml-2 text-xs text-teal-700">
											{p.activeBookings} active
										</span>
									)}
								</td>
								<td className="px-4 py-3 text-slate-600">{formatJoined(p._id)}</td>
								<td className="px-4 py-3 text-right">
									<Link
										to={`/patients/${p._id}`}
										className="px-3 py-1.5 text-xs font-medium text-teal-700 border border-teal-200 rounded-md hover:bg-teal-600 hover:text-white transition-colors"
									>
										View
									</Link>
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-slate-500">
									No patients match your search.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Patients;
