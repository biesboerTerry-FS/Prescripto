import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { HRContext } from "../../../context/HRContext";

/** Admin-only configuration for departments and role/specialization labels. */
const HRDepartments = () => {
	const {
		departments,
		roles,
		saveDepartment,
		removeDepartment,
		saveRole,
		removeRole,
	} = useContext(HRContext);
	const [deptName, setDeptName] = useState("");
	const [roleLabel, setRoleLabel] = useState("");
	const [editDept, setEditDept] = useState(null);
	const [editRole, setEditRole] = useState(null);

	const submitDepartment = async (event) => {
		event.preventDefault();
		if (!deptName.trim()) return toast.error("Enter a department name.");
		const result = await saveDepartment({ name: deptName.trim() }, editDept);
		if (result.success) {
			toast.success(result.message);
			setDeptName("");
			setEditDept(null);
		} else toast.error(result.message);
	};

	const submitRole = async (event) => {
		event.preventDefault();
		if (!roleLabel.trim()) return toast.error("Enter a role label.");
		const result = await saveRole({ label: roleLabel.trim() }, editRole);
		if (result.success) {
			toast.success(result.message);
			setRoleLabel("");
			setEditRole(null);
		} else toast.error(result.message);
	};

	const idOf = (row) => String(row.id || row._id);

	return (
		<div className="p-5 mx-auto max-w-[1400px]" data-testid="hr-departments">
			<h1 className="text-2xl font-semibold text-slate-800" data-testid="hr-departments-heading">
				Roles &amp; departments
			</h1>
			<p className="mt-1 text-sm text-slate-500">
				Keep the organization chart current. Labels are offered in the staff forms and directory filters.
			</p>

			<div className="grid gap-5 mt-5 lg:grid-cols-2">
				<section className="p-5 bg-white border border-slate-200 rounded-xl">
					<h2 className="text-lg font-semibold text-slate-800">Departments</h2>
					<form onSubmit={submitDepartment} className="flex gap-2 mt-3">
						<input
							value={deptName}
							onChange={(event) => setDeptName(event.target.value)}
							placeholder="New department name"
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
							data-testid="hr-department-input"
						/>
						<button
							type="submit"
							className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary"
							data-testid="hr-department-add"
						>
							{editDept ? "Save" : "Add"}
						</button>
					</form>
					<ul className="mt-4 divide-y divide-slate-100" data-testid="hr-department-list">
						{departments.map((row) => (
							<li key={idOf(row)} className="flex items-center justify-between gap-3 py-3">
								<div>
									<p className="text-sm font-medium text-slate-800">{row.name}</p>
									<p className="text-xs text-slate-500">
										{row.head ? `Lead: ${row.head}` : row.description || "No description"}
									</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										className="text-xs font-medium text-primary hover:underline"
										onClick={() => {
											setEditDept(idOf(row));
											setDeptName(row.name);
										}}
										data-testid={`hr-department-edit-${idOf(row)}`}
									>
										Edit
									</button>
									<button
										type="button"
										className="text-xs font-medium text-red-600 hover:underline"
										onClick={async () => {
											const result = await removeDepartment(idOf(row));
											if (result.success) toast.success(result.message);
											else toast.error(result.message);
										}}
										data-testid={`hr-department-remove-${idOf(row)}`}
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>
				</section>

				<section className="p-5 bg-white border border-slate-200 rounded-xl">
					<h2 className="text-lg font-semibold text-slate-800">Role / specialization labels</h2>
					<form onSubmit={submitRole} className="flex gap-2 mt-3">
						<input
							value={roleLabel}
							onChange={(event) => setRoleLabel(event.target.value)}
							placeholder="New role label"
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
							data-testid="hr-role-input"
						/>
						<button
							type="submit"
							className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary"
							data-testid="hr-role-add"
						>
							{editRole ? "Save" : "Add"}
						</button>
					</form>
					<ul className="mt-4 divide-y divide-slate-100" data-testid="hr-role-list">
						{roles.map((row) => (
							<li key={idOf(row)} className="flex items-center justify-between gap-3 py-3">
								<div>
									<p className="text-sm font-medium text-slate-800">{row.label}</p>
									<p className="text-xs text-slate-500">{row.department || "General"}</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										className="text-xs font-medium text-primary hover:underline"
										onClick={() => {
											setEditRole(idOf(row));
											setRoleLabel(row.label);
										}}
										data-testid={`hr-role-edit-${idOf(row)}`}
									>
										Edit
									</button>
									<button
										type="button"
										className="text-xs font-medium text-red-600 hover:underline"
										onClick={async () => {
											const result = await removeRole(idOf(row));
											if (result.success) toast.success(result.message);
											else toast.error(result.message);
										}}
										data-testid={`hr-role-remove-${idOf(row)}`}
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
};

export default HRDepartments;
