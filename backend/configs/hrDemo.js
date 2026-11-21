import doctorModel from "../models/doctorModel.js";
import { scheduleRequestModel } from "../models/portalModel.js";
import {
	hrDepartmentModel,
	hrRoleModel,
	hrPayrunModel,
	hrNoteModel,
} from "../models/hrModel.js";

// Idempotent HR demo data shared by the explicit seed script and the first
// admin-only HR request. Natural keys keep re-runs (and concurrent serverless
// invocations) from creating duplicates.

const day = 86400000;
const now = () => Date.now();
const isoDate = (offset) => new Date(now() + offset * day).toISOString().slice(0, 10);
const isoTime = (offset) => new Date(now() + offset * day).toISOString();

export const DEPARTMENTS = [
	{ name: "Primary Care", description: "Everyday consultations and family medicine.", head: "Dr. Richard James" },
	{ name: "Women's Health", description: "Obstetrics, gynecology and wellbeing.", head: "Dr. Emily Larson" },
	{ name: "Dermatology", description: "Skin, hair and nail care.", head: "Dr. Jennifer Garcia" },
	{ name: "Pediatrics", description: "Care for infants, children and adolescents.", head: "Dr. Alexa Dwyer" },
	{ name: "Neurology", description: "Diagnosis and treatment of nervous-system conditions.", head: "Dr. Ava Hudson" },
	{ name: "Gastroenterology", description: "Digestive health and endoscopy.", head: "Dr. Daniel Brown" },
	{ name: "Administration", description: "Clinic operations and coordination.", head: "Clinic Coordinator" },
];

export const ROLES = [
	{ label: "General Physician", department: "Primary Care", description: "Primary care physician" },
	{ label: "Gynecologist", department: "Women's Health", description: "Women's health specialist" },
	{ label: "Dermatologist", department: "Dermatology", description: "Skin specialist" },
	{ label: "Pediatrician", department: "Pediatrics", description: "Child health specialist" },
	{ label: "Neurologist", department: "Neurology", description: "Nervous-system specialist" },
	{ label: "Gastroenterologist", department: "Gastroenterology", description: "Digestive health specialist" },
	{ label: "Nurse Practitioner", department: "Primary Care", description: "Advanced practice nursing" },
	{ label: "Clinic Manager", department: "Administration", description: "Operations lead" },
];

export const STAFF = [
	{ email: "richard.james@prescripto.com", department: "Primary Care", hrRole: "General Physician", hrStatus: "active" },
	{ email: "emily.larson@prescripto.com", department: "Women's Health", hrRole: "Gynecologist", hrStatus: "active" },
	{ email: "jennifer.garcia@prescripto.com", department: "Dermatology", hrRole: "Dermatologist", hrStatus: "active" },
	{ email: "alexa.dwyer@prescripto.com", department: "Pediatrics", hrRole: "Pediatrician", hrStatus: "active" },
	{ email: "ava.hudson@prescripto.com", department: "Neurology", hrRole: "Neurologist", hrStatus: "active" },
	{ email: "daniel.brown@prescripto.com", department: "Gastroenterology", hrRole: "Gastroenterologist", hrStatus: "active" },
	{ email: "daniel.okafor@prescripto.com", department: "Primary Care", hrRole: "General Physician", hrStatus: "inactive" },
	{ email: "amara.nwosu@prescripto.com", department: "Women's Health", hrRole: "Gynecologist", hrStatus: "active" },
];

const PERIODS = ["2026-08", "2026-09", "2026-10"];

const PAYRUNS = [
	{ index: 0, period: PERIODS[0], status: "paid", offset: -45, note: "August pay run — 4 weeks" },
	{ index: 1, period: PERIODS[0], status: "paid", offset: -45, note: "August pay run — 4 weeks" },
	{ index: 2, period: PERIODS[1], status: "paid", offset: -15, note: "September pay run — 4 weeks" },
	{ index: 3, period: PERIODS[1], status: "processed", offset: -15, note: "September pay run — pending bank confirmation" },
	{ index: 4, period: PERIODS[2], status: "processed", offset: -2, note: "October pay run" },
	{ index: 5, period: PERIODS[2], status: "draft", offset: -2, note: "October pay run — under review" },
	{ index: 7, period: PERIODS[2], status: "processed", offset: -2, note: "October pay run" },
];

const NOTES = [
	{ index: 0, author: "Clinic Coordinator", text: "Consistently strong patient feedback; great with complex cases.", daysAgo: 4 },
	{ index: 1, author: "Dr. Richard James", text: "Took on extra clinic sessions during the summer coverage gap.", daysAgo: 9 },
	{ index: 2, author: "Clinic Coordinator", text: "Excellent documentation discipline. Mentor for new dermatology staff.", daysAgo: 14 },
	{ index: 3, author: "Dr. Emily Larson", text: "Reliable, punctual and well liked by families in the pediatric wing.", daysAgo: 6 },
	{ index: 4, author: "Clinic Coordinator", text: "Completed advanced neurology training — consider for lead role.", daysAgo: 21 },
	{ index: 7, author: "Dr. Richard James", text: "Returning from parental leave; welcome-back plan confirmed with admin.", daysAgo: 2 },
];

const REQUESTS = [
	{ index: 0, daysAhead: 8, reason: "Annual leave — covering doctor arranged.", status: "pending", daysAgo: 2 },
	{ index: 1, daysAhead: 12, reason: "Conference attendance in Manchester.", status: "pending", daysAgo: 3 },
	{ index: 2, daysAhead: 15, reason: "Family commitment, afternoon session only.", status: "approved", daysAgo: 6 },
	{ index: 3, daysAhead: 18, reason: "Medical appointment.", status: "declined", daysAgo: 8 },
	{ index: 4, daysAhead: 22, reason: "Teaching commitment at the university.", status: "pending", daysAgo: 1 },
	{ index: 5, daysAhead: 26, reason: "Personal day — no bookings scheduled.", status: "pending", daysAgo: 4 },
];

/** Upserts every HR demo collection. Safe to call repeatedly. */
export const seedHRTables = async () => {
	for (const item of DEPARTMENTS) {
		await hrDepartmentModel.updateOne({ name: item.name }, { $set: item }, { upsert: true });
	}
	for (const item of ROLES) {
		await hrRoleModel.updateOne({ label: item.label }, { $set: item }, { upsert: true });
	}

	const doctors = await Promise.all(
		STAFF.map((item) => doctorModel.findOne({ email: item.email }))
	);
	for (const [index, doctor] of doctors.entries()) {
		if (!doctor) continue;
		await doctorModel.updateOne(
			{ _id: doctor._id },
			{ $set: STAFF[index] },
			{ upsert: false }
		);
	}

	for (const item of PAYRUNS) {
		const doctor = doctors[item.index];
		if (!doctor) continue;
		await hrPayrunModel.updateOne(
			{ staffId: doctor._id.toString(), period: item.period },
			{
				$set: {
					staffName: doctor.name,
					department: doctor.department || "",
					amount: Math.round((doctor.fees || 0) * 4 * 100) / 100,
					status: item.status,
					paymentDate: isoDate(item.offset),
					note: item.note,
				},
			},
			{ upsert: true }
		);
	}

	for (const item of NOTES) {
		const doctor = doctors[item.index];
		if (!doctor) continue;
		await hrNoteModel.updateOne(
			{ staffId: doctor._id.toString(), author: item.author, text: item.text },
			{
				$set: {
					staffName: doctor.name,
					date: isoDate(-item.daysAgo),
				},
			},
			{ upsert: true }
		);
	}

	for (const item of REQUESTS) {
		const doctor = doctors[item.index];
		if (!doctor) continue;
		await scheduleRequestModel.updateOne(
			{
				type: "time-off",
				doctorId: doctor._id.toString(),
				date: isoDate(item.daysAhead),
				reason: item.reason,
			},
			{
				$set: {
					requester: doctor.name,
					role: "staff",
					status: item.status,
					createdAt: isoTime(-item.daysAgo),
				},
			},
			{ upsert: true }
		);
	}

	return {
		departments: DEPARTMENTS.length,
		roles: ROLES.length,
		staff: doctors.filter(Boolean).length,
		payruns: PAYRUNS.length,
		notes: NOTES.length,
		timeOff: REQUESTS.length,
	};
};

let seedPromise = null;

/**
 * Seeds the HR demo data once when the admin first opens the HR suite. The
 * check keeps repeated requests cheap; upserts keep concurrent invocations safe.
 */
export const ensureHRSeeded = async () => {
	if (!seedPromise) {
		seedPromise = (async () => {
			const counts = await Promise.all([
				hrDepartmentModel.countDocuments({}),
				hrRoleModel.countDocuments({}),
				hrPayrunModel.countDocuments({}),
				hrNoteModel.countDocuments({}),
				scheduleRequestModel.countDocuments({ type: "time-off" }),
			]);
			if (counts.some((count) => count === 0)) {
				await seedHRTables();
			}
		})().catch((error) => {
			seedPromise = null;
			console.error("HR demo seed failed:", error.message);
		});
	}
	return seedPromise;
};
