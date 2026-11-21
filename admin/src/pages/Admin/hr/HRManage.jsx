import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HRContext } from "../../../context/HRContext";
import { addressText, formatMoney } from "../../../lib/hrData";

const EMPTY_FORM = {
	name: "",
	email: "",
	password: "Demo123456",
	specialty: "",
	role: "",
	department: "",
	phone: "",
	line1: "",
	line2: "",
	fees: "",
	hrStatus: "active",
	degree: "",
	experience: "",
	about: "",
};

/** Admin-only staff CRUD. Deactivation is soft — records are never deleted. */
const HRManage = () => {
	const { staff, departments, roles, saveStaff, setStaffStatus, loading } =
		useContext(HRContext);
	const [form, setForm] = useState(EMPTY_FORM);
	const [editingId, setEditingId] = useState(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!roles.length) return;
		setForm((current) =>
			current.specialty
				? current
				: { ...current, specialty: roles[0].label, role: roles[0].label }
		);
	}, [roles]);

	const setField = (key) => (event) =>
		setForm((current) => ({ ...current, [key]: event.target.value }));

	const startEdit = (row) => {
		setEditingId(String(row.id || row._id));
		setForm({
			...EMPTY_FORM,
			name: row.name || "",
			email: row.email || "",
			password: "",
			specialty: row.specialty || "",
			role: row.hrRole || row.role || row.specialty || "",
			department: row.department || "",
			phone: row.phone || "",
			line1: row.address?.line1 || "",
			line2: row.address?.line2 || "",
			fees: String(row.fees ?? row.rate ?? ""),
			hrStatus: row.hrStatus || row.status || "active",
			degree: row.degree || "",
			experience: row.experience || "",
			about: row.about || "",
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!form.name.trim() || !form.email.trim() || !form.specialty) {
			toast.error("Name, email and role are required.");
			return;
		}
		setBusy(true);
		const payload = {
			name: form.name.trim(),
			email: form.email.trim().toLowerCase(),
			specialty: form.specialty,
			role: form.role || form.specialty,
			department: form.department,
			phone: form.phone,
			address: { line1: form.line1, line2: form.line2 },
			fees: Number(form.fees) || 0,
			hrStatus: form.hrStatus,
			degree: form.degree,
			experience: form.experience,
			about: form.about,
		};
		if (form.password) payload.password = form.password;
		const result = await saveStaff(payload, editingId);
		setBusy(false);
		if (result.success) {
			toast.success(result.message);
			setEditingId(null);
			setForm(EMPTY_FORM);
		} else {
			toast.error(result.message || "Could not save staff member.");
		}
	};

	const handleStatus = async (row, status) => {
		const id = String(row.id || row._id);
		const result = await setStaffStatus(id, status);
		if (result.success) toast.success(result.message);
		else toast.error(result.message || "Could not update status.");
	};

	const inputClass = "w-full px-3 py-2 mt-1 text-sm border border-slate-300 rounded-lg";
	const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

	return (
		<div className="p-5 mx-auto max-w-[1400px]" data-testid="hr-manage">
			<h1 className="text-2xl font-semibold text-slate-800" data-testid="hr-manage-heading">
				Staff management
			</h1>
			<p className="mt-1 text-sm text-slate-500">
				Add, edit or deactivate staff. Accounts are never deleted, and doctor login details stay intact.
			</p>

			<form
				onSubmit={handleSubmit}
				className="p-5 mt-5 bg-white border border-slate-200 rounded-xl"
				data-testid="hr-staff-form"
			>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-lg font-semibold text-slate-800">
						{editingId ? "Edit staff member" : "Add a staff member"}
					</h2>
					{editingId && (
						<button
							type="button"
							onClick={() => {
								setEditingId(null);
								setForm(EMPTY_FORM);
							}}
							className="text-sm text-primary hover:underline"
							data-testid="hr-cancel-edit"
						>
							Cancel edit
						</button>
					)}
				</div>
				<div className="grid gap-4 mt-4 md:grid-cols-3">
					<label className={labelClass}>
						Full name
						<input className={inputClass} required value={form.name} onChange={setField("name")} data-testid="hr-staff-name" />
					</label>
					<label className={labelClass}>
						Email
						<input className={inputClass} type="email" required value={form.email} onChange={setField("email")} data-testid="hr-staff-email" />
					</label>
					<label className={labelClass}>
						Password {editingId && "(leave blank to keep)"}
						<input
							className={inputClass}
							type="password"
							minLength={6}
							required={!editingId}
							value={form.password}
							onChange={setField("password")}
							data-testid="hr-staff-password"
						/>
					</label>
					<label className={labelClass}>
						Role / specialization
						<select className={inputClass} required value={form.specialty} onChange={setField("specialty")} data-testid="hr-staff-role">
							{!form.specialty && <option value="">Select a role</option>}
							{[...new Set([...roles.map((r) => r.label), ...staff.map((s) => s.specialty).filter(Boolean)])].map((label) => (
								<option key={label} value={label}>{label}</option>
							))}
						</select>
					</label>
					<label className={labelClass}>
						Department
						<select className={inputClass} value={form.department} onChange={setField("department")} data-testid="hr-staff-department">
							<option value="">Unassigned</option>
							{[...new Set([...departments.map((d) => d.name), ...staff.map((s) => s.department).filter(Boolean)])].map((name) => (
								<option key={name} value={name}>{name}</option>
							))}
						</select>
					</label>
					<label className={labelClass}>
						Phone
						<input className={inputClass} value={form.phone} onChange={setField("phone")} data-testid="hr-staff-phone" />
					</label>
					<label className={labelClass}>
						Address line 1
						<input className={inputClass} value={form.line1} onChange={setField("line1")} data-testid="hr-staff-address1" />
					</label>
					<label className={labelClass}>
						Address line 2
						<input className={inputClass} value={form.line2} onChange={setField("line2")} data-testid="hr-staff-address2" />
					</label>
					<label className={labelClass}>
						Rate ($ / visit)
						<input className={inputClass} type="number" min="0" value={form.fees} onChange={setField("fees")} data-testid="hr-staff-rate" />
					</label>
					<label className={labelClass}>
						Status
						<select className={inputClass} value={form.hrStatus} onChange={setField("hrStatus")} data-testid="hr-staff-status">
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</label>
				</div>
				<div className="grid gap-4 mt-4 md:grid-cols-2">
					<label className={labelClass}>
						Degree
						<input className={inputClass} value={form.degree} onChange={setField("degree")} data-testid="hr-staff-degree" />
					</label>
					<label className={labelClass}>
						Experience
						<input className={inputClass} value={form.experience} onChange={setField("experience")} data-testid="hr-staff-experience" />
					</label>
				</div>
				<label className={`${labelClass} mt-4`}>
					About
					<textarea className={inputClass} rows={2} value={form.about} onChange={setField("about")} data-testid="hr-staff-about" />
				</label>
				<div className="flex justify-end mt-5">
					<button
						type="submit"
						disabled={busy}
						className="px-6 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60"
						data-testid={editingId ? "hr-save-staff" : "hr-add-staff"}
					>
						{busy ? "Saving…" : editingId ? "Save changes" : "Add staff"}
					</button>
				</div>
			</form>

			<div className="mt-6 overflow-x-auto bg-white border border-slate-200 rounded-xl">
				<table className="w-full text-sm text-left" data-testid="hr-manage-table">
					<thead className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
						<tr>
							<th className="px-4 py-3">Name</th>
							<th className="px-4 py-3">Role</th>
							<th className="px-4 py-3">Department</th>
							<th className="px-4 py-3">Rate</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{staff.map((row) => {
							const id = String(row.id || row._id);
							const rowStatus = row.hrStatus || row.status || "active";
							return (
								<tr key={id} data-testid="hr-manage-row">
									<td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
									<td className="px-4 py-3 text-slate-600">{row.hrRole || row.specialty}</td>
									<td className="px-4 py-3 text-slate-600">{row.department || "—"}</td>
									<td className="px-4 py-3 text-slate-600">{formatMoney(row.fees ?? row.rate)}</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
											rowStatus === "inactive" ? "bg-slate-100 text-slate-600" : "bg-teal-50 text-teal-700"
										}`}>
											{rowStatus}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-2">
											<button
												type="button"
												onClick={() => startEdit(row)}
												className="text-sm font-medium text-primary hover:underline"
												data-testid={`hr-edit-staff-${id}`}
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => handleStatus(row, rowStatus === "active" ? "inactive" : "active")}
												className="text-sm font-medium text-red-600 hover:underline"
												data-testid={
													rowStatus === "active"
														? `hr-deactivate-staff-${id}`
														: `hr-activate-staff-${id}`
												}
											>
												{rowStatus === "active" ? "Deactivate" : "Reactivate"}
											</button>
										</div>
									</td>
								</tr>
							);
						})}
						{staff.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-10 text-center text-slate-500">
									{loading ? "Loading staff…" : "No staff yet."}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<p className="mt-3 text-xs text-slate-400">
				Addresses: {staff.slice(0, 3).map((row) => `${row.name} — ${addressText(row.address)}`).join(" · ") || "—"}
			</p>
		</div>
	);
};

export default HRManage;
