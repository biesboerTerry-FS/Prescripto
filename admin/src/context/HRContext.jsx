import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import * as HR from "../lib/hrData";
import { AdminContext } from "./AdminContext";

export const HRContext = createContext();

const isOffline = (error) => Boolean(error && !error.response);
const isLocalId = (id) => /^(demo-|local-)/.test(String(id || ""));
const errorMessage = (error, fallback) =>
	error?.response?.data?.message || fallback;

const normaliseStaff = (payload, id) => ({
	id,
	_id: id,
	name: payload.name,
	email: payload.email,
	specialty: payload.specialty,
	hrRole: payload.role || payload.hrRole || payload.specialty,
	role: payload.role || payload.specialty,
	department: payload.department || "",
	phone: payload.phone || "",
	address: payload.address || { line1: "", line2: "" },
	fees: Number(payload.fees) || 0,
	rate: Number(payload.fees) || 0,
	hrStatus: payload.hrStatus || "active",
	status: payload.hrStatus || "active",
	available: payload.available !== false,
	image: payload.image || "",
	degree: payload.degree || "",
	experience: payload.experience || "",
	about: payload.about || "",
});

// Holds admin-only HR data. Every mutating call tries the authenticated API
// first and falls back to localStorage when the backend is unreachable.
const HRContextProvider = (props) => {
	const { adminToken } = useContext(AdminContext);
	const [staff, setStaff] = useState([]);
	const [departments, setDepartments] = useState(() => HR.getLocalDepartments());
	const [roles, setRoles] = useState(() => HR.getLocalRoles());
	const [payroll, setPayroll] = useState(() => HR.getLocalPayroll());
	const [notes, setNotes] = useState(() => HR.getLocalNotes());
	const [timeOff, setTimeOff] = useState(() => HR.getLocalTimeOff());
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(false);
	const version = HR.useHRData();

	const refresh = useCallback(async () => {
		if (!localStorage.getItem("adminToken")) return;
		setLoading(true);
		const requests = [
			api.get("/admin/hr/staff"),
			api.get("/admin/hr/departments"),
			api.get("/admin/hr/roles"),
			api.get("/admin/hr/payroll"),
			api.get("/admin/hr/notes"),
			api.get("/admin/hr/time-off"),
			api.get("/admin/hr/summary"),
		];
		const settled = await Promise.allSettled(requests);
		const value = (index, fallback) =>
			settled[index].status === "fulfilled"
				? settled[index].value.data
				: { success: false, ...fallback };

		const staffData = value(0, { staff: [] });
		const deptData = value(1, { departments: HR.getLocalDepartments() });
		const roleData = value(2, { roles: HR.getLocalRoles() });
		const payData = value(3, { payruns: HR.getLocalPayroll() });
		const noteData = value(4, { notes: HR.getLocalNotes() });
		const timeData = value(5, { requests: HR.getLocalTimeOff() });
		const summaryData = value(6, { summary: null });

		setStaff(
			staffData.success && Array.isArray(staffData.staff)
				? HR.mergeStaff(staffData.staff, HR.getLocalStaff())
				: HR.mergeStaff([], HR.getLocalStaff())
		);
		setDepartments(Array.isArray(deptData.departments) ? deptData.departments : HR.getLocalDepartments());
		setRoles(Array.isArray(roleData.roles) ? roleData.roles : HR.getLocalRoles());
		setPayroll(HR.mergeById(payData.payruns || [], HR.getLocalPayroll()));
		setNotes(HR.mergeById(noteData.notes || [], HR.getLocalNotes()));
		setTimeOff(HR.mergeById(timeData.requests || [], HR.getLocalTimeOff()));
		setSummary(summaryData.success ? summaryData.summary : null);
		setLoading(false);
	}, []);

	useEffect(() => {
		if (adminToken) refresh();
	}, [refresh, version, adminToken]);

	const saveStaff = async (payload, id) => {
		try {
			const { data } = id
				? await api.put(`/admin/hr/staff/${id}`, payload)
				: await api.post("/admin/hr/staff", payload);
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: data.message || "Staff member saved" };
		} catch (error) {
			if (isOffline(error)) {
				const staffId = id || HR.newLocalStaffId();
				HR.saveLocalStaff(normaliseStaff(payload, staffId));
				return {
					success: true,
					local: true,
					message: id ? "Staff member updated locally" : "Staff member added locally",
				};
			}
			return { success: false, message: errorMessage(error, "Could not save staff member") };
		}
	};

	const setStaffStatus = async (id, status) => {
		if (isLocalId(id)) {
			HR.saveLocalStaff({ id, hrStatus: status, status });
			return { success: true, local: true, message: `Staff member ${status}` };
		}
		try {
			const { data } = await api.patch(`/admin/hr/staff/${id}/status`, { status });
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: data.message };
		} catch (error) {
			if (isOffline(error)) {
				HR.saveLocalStaff({ id, hrStatus: status, status });
				return { success: true, local: true, message: `Staff member ${status}` };
			}
			return { success: false, message: errorMessage(error, "Could not update status") };
		}
	};

	const saveDepartment = async (payload, id) => {
		try {
			const { data } = id
				? await api.put(`/admin/hr/departments/${id}`, payload)
				: await api.post("/admin/hr/departments", payload);
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: "Department saved" };
		} catch (error) {
			if (isOffline(error)) {
				const all = HR.getLocalDepartments();
				const next = id
					? all.map((row) => (String(row.id) === String(id) ? { ...row, ...payload } : row))
					: [{ id: `local-dept-${Date.now()}`, ...payload }, ...all];
				HR.saveLocalDepartments(next);
				return { success: true, local: true, message: "Department saved locally" };
			}
			return { success: false, message: errorMessage(error, "Could not save department") };
		}
	};

	const removeDepartment = async (id) => {
		if (isLocalId(id)) {
			HR.saveLocalDepartments(HR.getLocalDepartments().filter((row) => String(row.id) !== String(id)));
			return { success: true, local: true, message: "Department removed" };
		}
		try {
			const { data } = await api.delete(`/admin/hr/departments/${id}`);
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: "Department removed" };
		} catch (error) {
			if (isOffline(error)) {
				HR.saveLocalDepartments(HR.getLocalDepartments().filter((row) => String(row.id) !== String(id)));
				return { success: true, local: true, message: "Department removed locally" };
			}
			return { success: false, message: errorMessage(error, "Could not remove department") };
		}
	};

	const saveRole = async (payload, id) => {
		try {
			const { data } = id
				? await api.put(`/admin/hr/roles/${id}`, payload)
				: await api.post("/admin/hr/roles", payload);
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: "Role label saved" };
		} catch (error) {
			if (isOffline(error)) {
				const all = HR.getLocalRoles();
				const next = id
					? all.map((row) => (String(row.id) === String(id) ? { ...row, ...payload } : row))
					: [{ id: `local-role-${Date.now()}`, ...payload }, ...all];
				HR.saveLocalRoles(next);
				return { success: true, local: true, message: "Role label saved locally" };
			}
			return { success: false, message: errorMessage(error, "Could not save role label") };
		}
	};

	const removeRole = async (id) => {
		if (isLocalId(id)) {
			HR.saveLocalRoles(HR.getLocalRoles().filter((row) => String(row.id) !== String(id)));
			return { success: true, local: true, message: "Role removed" };
		}
		try {
			const { data } = await api.delete(`/admin/hr/roles/${id}`);
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: "Role removed" };
		} catch (error) {
			if (isOffline(error)) {
				HR.saveLocalRoles(HR.getLocalRoles().filter((row) => String(row.id) !== String(id)));
				return { success: true, local: true, message: "Role removed locally" };
			}
			return { success: false, message: errorMessage(error, "Could not remove role") };
		}
	};

	const runPayroll = async ({ period, staffIds = [], note = "" }) => {
		try {
			const { data } = await api.post("/admin/hr/payroll/run", { period, staffIds, note });
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return {
				success: true,
				message: data.message || "Payroll run complete",
				total: data.total,
			};
		} catch (error) {
			if (isOffline(error)) {
				const selected = staffIds.length
					? staff.filter((row) => staffIds.includes(String(row.id || row._id)))
					: staff.filter((row) => (row.hrStatus || row.status) === "active");
				const createdAt = new Date().toISOString();
				const rows = selected.map((row, index) => ({
					id: `local-payrun-${Date.now()}-${index}`,
					staffId: String(row.id || row._id),
					staffName: row.name,
					department: row.department || "",
					period,
					amount: (Number(row.fees) || 0) * 4,
					status: "processed",
					paymentDate: createdAt.slice(0, 10),
					note: note || `${period} pay run — 4 weeks`,
					createdAt,
				}));
				HR.saveLocalPayruns([...rows, ...HR.getLocalPayroll()]);
				return { success: true, local: true, message: "Payroll run recorded locally" };
			}
			return { success: false, message: errorMessage(error, "Could not run payroll") };
		}
	};

	const reviewTimeOff = async (id, status) => {
		if (isLocalId(id)) {
			HR.saveLocalTimeOff(
				HR.getLocalTimeOff().map((row) => (String(row.id) === String(id) ? { ...row, status } : row))
			);
			return { success: true, local: true, message: `Request ${status}` };
		}
		try {
			const { data } = await api.patch(`/admin/hr/time-off/${id}`, { status });
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: `Request ${status}` };
		} catch (error) {
			if (isOffline(error)) {
				HR.saveLocalTimeOff(
					HR.getLocalTimeOff().map((row) => (String(row.id) === String(id) ? { ...row, status } : row))
				);
				return { success: true, local: true, message: `Request ${status}` };
			}
			return { success: false, message: errorMessage(error, "Could not update request") };
		}
	};

	const addNote = async (payload) => {
		try {
			const { data } = await api.post("/admin/hr/notes", payload);
			if (!data?.success) return { success: false, message: data?.message };
			await refresh();
			return { success: true, message: "Performance note added" };
		} catch (error) {
			if (isOffline(error)) {
				const target = staff.find(
					(row) => String(row.id || row._id) === String(payload.staffId)
				);
				HR.saveLocalNotes([
					{
						id: `local-note-${Date.now()}`,
						staffId: payload.staffId,
						staffName: target?.name || "Staff member",
						author: payload.author || "Administrator",
						text: payload.text,
						date: new Date().toISOString().slice(0, 10),
						createdAt: new Date().toISOString(),
					},
					...HR.getLocalNotes(),
				]);
				return { success: true, local: true, message: "Note added locally" };
			}
			return { success: false, message: errorMessage(error, "Could not add note") };
		}
	};

	const value = {
		staff,
		departments,
		roles,
		payroll,
		notes,
		timeOff,
		summary,
		loading,
		refresh,
		saveStaff,
		setStaffStatus,
		saveDepartment,
		removeDepartment,
		saveRole,
		removeRole,
		runPayroll,
		reviewTimeOff,
		addNote,
	};

	return <HRContext.Provider value={value}>{props.children}</HRContext.Provider>;
};

export default HRContextProvider;
