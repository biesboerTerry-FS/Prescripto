import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HRContext } from "../../../context/HRContext";
import { addressText, formatMoney } from "../../../lib/hrData";

const statusClass = (status) =>
	status === "inactive"
		? "bg-slate-100 text-slate-600"
		: "bg-teal-50 text-teal-700";

/** Admin-only staff directory: searchable, filterable table with a detail view. */
const HRDirectory = () => {
	const { staff, payroll, notes, loading } = useContext(HRContext);
	const [query, setQuery] = useState("");
	const [department, setDepartment] = useState("all");
	const [status, setStatus] = useState("all");
	const [selectedId, setSelectedId] = useState(null);

	const departments = useMemo(
		() => [...new Set(staff.map((row) => row.department).filter(Boolean))].sort(),
		[staff]
	);

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase();
		return staff.filter((row) => {
			const matchesQuery =
				!q ||
				[row.name, row.specialty, row.hrRole, row.department, row.email, row.phone]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(q));
			const matchesDept = department === "all" || row.department === department;
			const matchesStatus = status === "all" || (row.hrStatus || row.status || "active") === status;
			return matchesQuery && matchesDept && matchesStatus;
		});
	}, [staff, query, department, status]);

	const selected = staff.find((row) => String(row.id || row._id) === String(selectedId));
	const selectedPay = payroll.filter(
		(row) => String(row.staffId) === String(selectedId)
	);
	const selectedNotes = notes.filter(
		(row) => String(row.staffId) === String(selectedId)
	);

	return (
		<div className="p-5 mx-auto max-w-[1400px]" data-testid="hr-directory">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold text-slate-800" data-testid="hr-directory-heading">
						Staff directory
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						{staff.length} staff members across {departments.length} departments. Doctors are managed here as staff.
					</p>
				</div>
				<Link
					to="/hr/manage"
					className="px-4 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary-dark"
					data-testid="hr-manage-link"
				>
					Manage staff
				</Link>
			</div>

			<div className="grid gap-3 mt-5 sm:grid-cols-[1fr_220px_180px]">
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Search
					<input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Name, role, department or email"
						className="w-full px-3 py-2 mt-1 text-sm font-normal normal-case tracking-normal border border-slate-300 rounded-lg"
						data-testid="hr-staff-search"
					/>
				</label>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Department
					<select
						value={department}
						onChange={(event) => setDepartment(event.target.value)}
						className="w-full px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-department-filter"
					>
						<option value="all">All departments</option>
						{departments.map((item) => (
							<option key={item} value={item}>{item}</option>
						))}
					</select>
				</label>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Status
					<select
						value={status}
						onChange={(event) => setStatus(event.target.value)}
						className="w-full px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-status-filter"
					>
						<option value="all">All statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</label>
			</div>

			<div className="mt-5 overflow-x-auto bg-white border border-slate-200 rounded-xl">
				<table className="w-full text-sm text-left" data-testid="hr-staff-table">
					<thead className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
						<tr>
							<th className="px-4 py-3">Name</th>
							<th className="px-4 py-3">Role / Specialization</th>
							<th className="px-4 py-3">Department</th>
							<th className="px-4 py-3">Email</th>
							<th className="px-4 py-3">Phone</th>
							<th className="px-4 py-3">Address</th>
							<th className="px-4 py-3">Rate</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{rows.map((row) => {
							const id = String(row.id || row._id);
							const rowStatus = row.hrStatus || row.status || "active";
							return (
								<tr key={id} className="hover:bg-slate-50" data-testid="hr-staff-row">
									<td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
									<td className="px-4 py-3 text-slate-600">{row.hrRole || row.specialty || "—"}</td>
									<td className="px-4 py-3 text-slate-600">{row.department || "—"}</td>
									<td className="px-4 py-3 text-slate-600">{row.email}</td>
									<td className="px-4 py-3 text-slate-600">{row.phone || "—"}</td>
									<td className="px-4 py-3 text-slate-600">{addressText(row.address)}</td>
									<td className="px-4 py-3 text-slate-600">{formatMoney(row.fees ?? row.rate)}</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClass(rowStatus)}`}>
											{rowStatus}
										</span>
									</td>
									<td className="px-4 py-3">
										<button
											type="button"
											onClick={() => setSelectedId(id)}
											className="text-sm font-medium text-primary hover:underline"
											data-testid={`hr-view-staff-${id}`}
										>
											View
										</button>
									</td>
								</tr>
							);
						})}
						{rows.length === 0 && (
							<tr>
								<td colSpan={9} className="px-4 py-10 text-center text-slate-500">
									{loading ? "Loading staff…" : "No staff match these filters."}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{selected && (
				<div className="fixed inset-0 z-40 flex items-start justify-center p-4 overflow-y-auto bg-slate-900/40" role="presentation">
					<div
						className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-xl"
						role="dialog"
						aria-modal="true"
						data-testid="hr-staff-detail"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-xl font-semibold text-slate-800">{selected.name}</h2>
								<p className="mt-0.5 text-sm text-slate-500">
									{selected.hrRole || selected.specialty} · {selected.department || "No department"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setSelectedId(null)}
								className="px-3 py-1 text-sm border border-slate-300 rounded-md"
								data-testid="hr-detail-close"
							>
								Close
							</button>
						</div>
						<dl className="grid gap-4 mt-5 sm:grid-cols-2">
							{[
								["Email", selected.email],
								["Phone", selected.phone || "—"],
								["Address", addressText(selected.address)],
								["Rate", formatMoney(selected.fees ?? selected.rate)],
								["Status", selected.hrStatus || selected.status || "active"],
								["Experience", selected.experience || "—"],
							].map(([label, value]) => (
								<div key={label} className="p-3 bg-slate-50 rounded-lg">
									<dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
									<dd className="mt-1 text-sm text-slate-800">{value}</dd>
								</div>
							))}
						</dl>
						<div className="grid gap-5 mt-6 sm:grid-cols-2">
							<section>
								<h3 className="text-sm font-semibold text-slate-800">Recent pay runs</h3>
								<ul className="mt-2 space-y-2 text-sm">
									{selectedPay.slice(0, 4).map((run) => (
										<li key={run.id || run._id} className="flex justify-between text-slate-600">
											<span>{run.period}</span>
											<span>{formatMoney(run.amount)} · {run.status}</span>
										</li>
									))}
									{selectedPay.length === 0 && <li className="text-slate-500">No pay runs yet.</li>}
								</ul>
							</section>
							<section>
								<h3 className="text-sm font-semibold text-slate-800">Performance notes</h3>
								<ul className="mt-2 space-y-2 text-sm">
									{selectedNotes.slice(0, 4).map((note) => (
										<li key={note.id || note._id} className="text-slate-600">
											<span className="font-medium">{note.author}:</span> {note.text}
										</li>
									))}
									{selectedNotes.length === 0 && <li className="text-slate-500">No notes yet.</li>}
								</ul>
							</section>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default HRDirectory;
