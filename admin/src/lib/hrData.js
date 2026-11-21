import { useEffect, useState } from "react";

// Local persistence for the admin HR suite. The API is the source of truth when
// reachable; localStorage keeps the portfolio demo working offline and holds
// optimistic copies of edits made during a session.

export const HR_DEPARTMENTS_KEY = "prescripto-hr-departments";
export const HR_ROLES_KEY = "prescripto-hr-roles";
export const HR_STAFF_KEY = "prescripto-hr-staff";
export const HR_PAYROLL_KEY = "prescripto-hr-payroll";
export const HR_NOTES_KEY = "prescripto-hr-notes";
export const HR_TIMEOFF_KEY = "prescripto-hr-timeoff";
const CHANGE_EVENT = "prescripto:hr-changed";

const emitChange = () => {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event(CHANGE_EVENT));
	}
};

/** Re-renders HR consumers whenever this tab or another tab writes HR data. */
export function useHRData() {
	const [version, setVersion] = useState(0);
	useEffect(() => {
		const sync = () => setVersion((v) => v + 1);
		window.addEventListener(CHANGE_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(CHANGE_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	return version;
}

const readList = (key, seedFn) => {
	try {
		const raw = localStorage.getItem(key);
		if (raw === null) {
			const seeded = seedFn();
			localStorage.setItem(key, JSON.stringify(seeded));
			return seeded;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return seedFn();
	}
};

const writeList = (key, list) => {
	try {
		localStorage.setItem(key, JSON.stringify(list));
	} catch {
		// Storage may be disabled; the current session still works.
	}
	emitChange();
};

const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
const daysAhead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

// Realistic demo people mirror the first eight seeded doctors, so the offline
// records and the live database tell the same story.
export const seedDepartments = () => [
	{ id: "dept-primary", name: "Primary Care", description: "Everyday consultations and family medicine.", head: "Dr. Richard James" },
	{ id: "dept-womens", name: "Women's Health", description: "Obstetrics, gynecology and wellbeing.", head: "Dr. Emily Larson" },
	{ id: "dept-derm", name: "Dermatology", description: "Skin, hair and nail care.", head: "Dr. Jennifer Garcia" },
	{ id: "dept-peds", name: "Pediatrics", description: "Care for infants, children and adolescents.", head: "Dr. Alexa Dwyer" },
	{ id: "dept-neuro", name: "Neurology", description: "Nervous-system conditions and treatment.", head: "Dr. Ava Hudson" },
	{ id: "dept-gastro", name: "Gastroenterology", description: "Digestive health and endoscopy.", head: "Dr. Daniel Brown" },
	{ id: "dept-admin", name: "Administration", description: "Clinic operations and coordination.", head: "Clinic Coordinator" },
];

export const seedRoles = () => [
	{ id: "role-gp", label: "General Physician", department: "Primary Care", description: "Primary care physician" },
	{ id: "role-gyn", label: "Gynecologist", department: "Women's Health", description: "Women's health specialist" },
	{ id: "role-derm", label: "Dermatologist", department: "Dermatology", description: "Skin specialist" },
	{ id: "role-peds", label: "Pediatrician", department: "Pediatrics", description: "Child health specialist" },
	{ id: "role-neuro", label: "Neurologist", department: "Neurology", description: "Nervous-system specialist" },
	{ id: "role-gastro", label: "Gastroenterologist", department: "Gastroenterology", description: "Digestive health specialist" },
	{ id: "role-nurse", label: "Nurse Practitioner", department: "Primary Care", description: "Advanced practice nursing" },
	{ id: "role-manager", label: "Clinic Manager", department: "Administration", description: "Operations lead" },
];

const DEMO_STAFF = [
	["1", "Dr. Richard James", "richard.james@prescripto.com", "General Physician", "Primary Care", "+1 555 0101", 50, "active"],
	["2", "Dr. Emily Larson", "emily.larson@prescripto.com", "Gynecologist", "Women's Health", "+1 555 0102", 75, "active"],
	["3", "Dr. Jennifer Garcia", "jennifer.garcia@prescripto.com", "Dermatologist", "Dermatology", "+1 555 0103", 75, "active"],
	["4", "Dr. Alexa Dwyer", "alexa.dwyer@prescripto.com", "Pediatrician", "Pediatrics", "+1 555 0104", 55, "active"],
	["5", "Dr. Ava Hudson", "ava.hudson@prescripto.com", "Neurologist", "Neurology", "+1 555 0105", 95, "active"],
	["6", "Dr. Daniel Brown", "daniel.brown@prescripto.com", "Gastroenterologist", "Gastroenterology", "+1 555 0106", 85, "active"],
	["7", "Dr. Daniel Okafor", "daniel.okafor@prescripto.com", "General Physician", "Primary Care", "+1 555 0107", 50, "inactive"],
	["8", "Dr. Amara Nwosu", "amara.nwosu@prescripto.com", "Gynecologist", "Women's Health", "+1 555 0108", 75, "active"],
];

export const seedStaff = () =>
	DEMO_STAFF.map(([n, name, email, specialty, department, phone, fees, hrStatus], index) => ({
		id: `demo-hr-staff-${n}`,
		_id: `demo-hr-staff-${n}`,
		source: "demo",
		name,
		email,
		specialty,
		hrRole: specialty,
		role: specialty,
		department,
		phone,
		address: { line1: `${17 + index}th Cross, Richmond`, line2: "Ring Road, London" },
		fees,
		rate: fees,
		hrStatus,
		status: hrStatus,
		available: true,
		image: "",
	}));

export const seedPayroll = () => {
	const staff = seedStaff();
	const plan = [
		[0, "2026-08", "paid", -45],
		[1, "2026-08", "paid", -45],
		[2, "2026-09", "paid", -15],
		[3, "2026-09", "processed", -15],
		[4, "2026-10", "processed", -2],
		[5, "2026-10", "draft", -2],
		[7, "2026-10", "processed", -2],
	];
	return plan.map(([index, period, status, offset], i) => ({
		id: `demo-payrun-${i}`,
		staffId: staff[index].id,
		staffName: staff[index].name,
		department: staff[index].department,
		period,
		amount: staff[index].fees * 4,
		status,
		paymentDate: daysAgo(-offset).slice(0, 10),
		note: `${period} pay run — 4 weeks`,
		createdAt: daysAgo(-offset),
	}));
};

export const seedNotes = () => {
	const staff = seedStaff();
	const plan = [
		[0, "Clinic Coordinator", "Consistently strong patient feedback; great with complex cases.", 4],
		[1, "Dr. Richard James", "Took on extra clinic sessions during the summer coverage gap.", 9],
		[2, "Clinic Coordinator", "Excellent documentation discipline. Mentor for new dermatology staff.", 14],
		[3, "Dr. Emily Larson", "Reliable, punctual and well liked by families in the pediatric wing.", 6],
		[4, "Clinic Coordinator", "Completed advanced neurology training — consider for lead role.", 21],
		[7, "Dr. Richard James", "Returning from parental leave; welcome-back plan confirmed with admin.", 2],
	];
	return plan.map(([index, author, text, ago], i) => ({
		id: `demo-note-${i}`,
		staffId: staff[index].id,
		staffName: staff[index].name,
		author,
		text,
		date: daysAgo(ago).slice(0, 10),
		createdAt: daysAgo(ago),
	}));
};

export const seedTimeOff = () => {
	const staff = seedStaff();
	const plan = [
		[0, 8, "Annual leave — covering doctor arranged.", "pending", 2],
		[1, 12, "Conference attendance in Manchester.", "pending", 3],
		[2, 15, "Family commitment, afternoon session only.", "approved", 6],
		[3, 18, "Medical appointment.", "declined", 8],
		[4, 22, "Teaching commitment at the university.", "pending", 1],
		[5, 26, "Personal day — no bookings scheduled.", "pending", 4],
	];
	return plan.map(([index, ahead, reason, status, ago], i) => ({
		id: `demo-timeoff-${i}`,
		type: "time-off",
		doctorId: staff[index].id,
		requester: staff[index].name,
		date: daysAhead(ahead),
		reason,
		status,
		role: "staff",
		createdAt: daysAgo(ago),
	}));
};

// ---- Departments & roles --------------------------------------------------

export const getLocalDepartments = () => readList(HR_DEPARTMENTS_KEY, seedDepartments);
export const getLocalRoles = () => readList(HR_ROLES_KEY, seedRoles);
export const saveLocalDepartments = (list) => writeList(HR_DEPARTMENTS_KEY, list);
export const saveLocalRoles = (list) => writeList(HR_ROLES_KEY, list);

// ---- Staff ----------------------------------------------------------------

export const getLocalStaff = () => readList(HR_STAFF_KEY, seedStaff);

/**
 * Only rows actually created/edited in this browser overlay API records.
 * The read-only demo seed rows are ignored when the API is reachable, so the
 * directory shows each of the sixty real staff exactly once.
 */
const isUserRow = (row) => row.localOverride || row.source === "local";

export const mergeStaff = (apiStaff = [], localStaff = getLocalStaff()) => {
	const userRows = localStaff.filter(isUserRow);
	const byId = new Map(userRows.map((row) => [String(row.id || row._id), row]));
	const byEmail = new Map(
		userRows.map((row) => [String(row.email || "").toLowerCase(), row])
	);
	const merged = apiStaff.map((row) => {
		const local =
			byId.get(String(row.id || row._id)) ||
			byEmail.get(String(row.email || "").toLowerCase());
		return { ...row, ...(local || {}), source: "api" };
	});
	const seenIds = new Set(merged.map((row) => String(row.id || row._id)));
	const seenEmails = new Set(merged.map((row) => String(row.email || "").toLowerCase()));
	return [
		...merged,
		...userRows.filter(
			(row) =>
				!seenIds.has(String(row.id || row._id)) &&
				!seenEmails.has(String(row.email || "").toLowerCase())
		),
	];
};

export const saveLocalStaff = (staff) => {
	const all = getLocalStaff();
	const id = String(staff.id || staff._id);
	const exists = all.some((row) => String(row.id || row._id) === id);
	const next = exists
		? all.map((row) =>
				String(row.id || row._id) === id
					? { ...row, ...staff, localOverride: true }
					: row
			)
		: [{ ...staff, id, _id: id, source: "local", localOverride: true }, ...all];
	writeList(HR_STAFF_KEY, next);
	return staff;
};

export const newLocalStaffId = () => `local-hr-staff-${Date.now()}`;

// ---- Payroll, notes and time-off ------------------------------------------

export const getLocalPayroll = () => readList(HR_PAYROLL_KEY, seedPayroll);
export const saveLocalPayruns = (list) => writeList(HR_PAYROLL_KEY, list);
export const getLocalNotes = () => readList(HR_NOTES_KEY, seedNotes);
export const saveLocalNotes = (list) => writeList(HR_NOTES_KEY, list);
export const getLocalTimeOff = () => readList(HR_TIMEOFF_KEY, seedTimeOff);
export const saveLocalTimeOff = (list) => writeList(HR_TIMEOFF_KEY, list);

/** API rows first, then any local-only rows; local status overrides API rows. */
export const mergeById = (apiRows = [], localRows = []) => {
	const localById = new Map(
		localRows.map((row) => [String(row.id || row._id), row])
	);
	const merged = apiRows.map((row) => {
		const id = String(row.id || row._id);
		const local = localById.get(id);
		return local ? { ...row, ...local } : row;
	});
	const seen = new Set(merged.map((row) => String(row.id || row._id)));
	return [
		...merged,
		...localRows.filter((row) => !seen.has(String(row.id || row._id))),
	];
};

export const formatMoney = (value) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(Number(value) || 0);

export const formatHRDate = (value) => {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export const addressText = (address) => {
	if (typeof address === "string") return address;
	if (!address || typeof address !== "object") return "—";
	return [address.line1, address.line2].filter(Boolean).join(", ") || "—";
};
