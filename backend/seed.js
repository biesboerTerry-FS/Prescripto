// Seeds demo data so the app looks alive instantly (portfolio-friendly).
//
//   node seed.js        (or: npm run seed)
//
// Seeds three things:
//   1. admin    — the admin account, from ADMIN_EMAIL / ADMIN_PASSWORD
//   2. patients — demo patients plus sample appointments (frontend)
//   3. doctors  — 60 doctors (10 per specialty) with photos from seed-data/
//
// Safe to re-run: records are matched by email and updated in place.
// Photo URLs use PUBLIC_API_URL (default http://localhost:3000). Set it to
// your deployed API URL before seeding a production database.
import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/mongoDB.js";
import adminModel from "./models/adminModel.js";
import doctorModel from "./models/doctorModel.js";
import userModel from "./models/userModel.js";
import appointmentModel from "./models/appointmentModel.js";
import { messageModel, scheduleRequestModel } from "./models/portalModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_PASSWORD = "Demo123456";
const API_URL = (process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
// Builds a public URL for a seeded doctor photo served by the API.
const photoURL = (file) => `${API_URL}/static/doctors/${file}`;

const PATIENTS = [
	{ name: "Demo Patient", email: "demo@prescripto.com", phone: "+1 555 0100", gender: "Female", dob: "1992-04-18" },
	{ name: "Sarah Thompson", email: "sarah.thompson@example.com", phone: "+1 555 0101", gender: "Female", dob: "1988-09-02" },
	{ name: "James Carter", email: "james.carter@example.com", phone: "+1 555 0102", gender: "Male", dob: "1975-01-27" },
	{ name: "Aisha Bello", email: "aisha.bello@example.com", phone: "+1 555 0103", gender: "Female", dob: "1997-11-09" },
	{ name: "Miguel Ortiz", email: "miguel.ortiz@example.com", phone: "+1 555 0104", gender: "Male", dob: "1983-06-14" },
];

const TIMES = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM"];

// next weekdays as the frontend formats them: M/D/YYYY
// Returns the next N weekday dates formatted the way the frontend expects (M/D/YYYY).
const nextWeekdays = (count) => {
	const days = [];
	const d = new Date();
	while (days.length < count) {
		d.setDate(d.getDate() + 1);
		if (d.getDay() !== 0 && d.getDay() !== 6) {
			days.push(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
		}
	}
	return days;
};

// Creates or updates the admin account from environment credentials.
const seedAdmin = async () => {
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;
	if (!email || !password) {
		console.warn("skip admin: set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env");
		return;
	}
	const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
	await adminModel.updateOne(
		{ email },
		{ $set: { email, password: hashed, name: "Administrator" } },
		{ upsert: true }
	);
	console.log(`admin ready: ${email}`);

	// Demo admin for portfolio visitors (limited to dev/local unless explicitly enabled)
	const demoAdminEmail = "demo-admin@prescripto.com";
	const demoAdminPassword = "DemoAdmin123!";
	const demoHashed = await bcrypt.hash(demoAdminPassword, await bcrypt.genSalt(10));
	await adminModel.updateOne(
		{ email: demoAdminEmail },
		{ $set: { email: demoAdminEmail, password: demoHashed, name: "Demo Admin" } },
		{ upsert: true }
	);
	console.log(`demo admin ready: ${demoAdminEmail} / ${demoAdminPassword}`);
};

// Loads doctor records and photos metadata, then inserts/updates them with public photo URLs.
const seedDoctors = async () => {
	const doctors = JSON.parse(
		fs.readFileSync(path.join(__dirname, "seed-data", "doctors.json"), "utf8")
	);
	const hashed = await bcrypt.hash(DEMO_PASSWORD, await bcrypt.genSalt(10));
	let created = 0;
	let updated = 0;
	for (const [index, doc] of doctors.entries()) {
		const fields = {
			name: doc.name,
			specialty: doc.specialty,
			degree: doc.degree,
			experience: doc.experience,
			about: doc.about,
			fees: doc.fees,
			// Seed data has no phone; give each demo doctor a predictable contact number.
			phone: doc.phone || `+1 555 01${String(index + 1).padStart(2, "0")}`,
			address: doc.address,
			image: photoURL(doc.image),
			available: true,
		};
		const existing = await doctorModel.findOne({ email: doc.email });
		if (existing) {
			await doctorModel.updateOne({ _id: existing._id }, { $set: fields });
			updated++;
		} else {
			await doctorModel.create({
				...fields,
				email: doc.email,
				password: hashed,
				date: Date.now(),
			});
			created++;
		}
	}
	console.log(`doctors: ${created} created, ${updated} updated (${doctors.length} total)`);
	return doctors;
};

// Seeds demo patient accounts (idempotent) for quick sign-in and testing.
const seedPatients = async () => {
	const hashed = await bcrypt.hash(DEMO_PASSWORD, await bcrypt.genSalt(10));
	const users = [];
	for (const p of PATIENTS) {
		const fields = {
			name: p.name,
			phone: p.phone,
			gender: p.gender,
			dob: p.dob,
			address: { line1: "12 Harbor Road", line2: "Suite 4" },
		};
		const user = await userModel.findOneAndUpdate(
			{ email: p.email },
			{ $set: fields, $setOnInsert: { password: hashed } },
			{ upsert: true, new: true }
		);
		users.push(user);
	}
	console.log(`patients ready: ${users.length} (password: ${DEMO_PASSWORD})`);
	return users;
};

// Creates a few sample appointments for the demo patient and reserves slots when needed.
const seedAppointments = async (users, doctors) => {
	const demo = users.find((u) => u.email === "demo@prescripto.com");
	const [d1, d2, d3] = nextWeekdays(3);
	const [a, b, c] = await Promise.all(
		doctors.slice(0, 3).map((d) => doctorModel.findOne({ email: d.email }))
	);
	const plan = [
		{ doc: a, date: d1, time: TIMES[0], paid: false, cancelled: false },
		{ doc: b, date: d2, time: TIMES[1], paid: true, cancelled: false },
		{ doc: c, date: d3, time: TIMES[2], paid: false, cancelled: true },
	];
	let created = 0;
	for (const item of plan) {
		const exists = await appointmentModel.findOne({
			userId: demo._id.toString(),
			doctorId: item.doc._id.toString(),
			slotDate: item.date,
		});
		if (exists) continue;

		const doctor = await doctorModel.findById(item.doc._id);
		const slots = doctor.slots_booked || {};
		if (!item.cancelled) {
			slots[item.date] = [...(slots[item.date] || []), item.time];
			await doctorModel.updateOne({ _id: doctor._id }, { $set: { slots_booked: slots } });
		}

		const doctorData = doctor.toObject();
		delete doctorData.password;
		delete doctorData.slots_booked;

		await appointmentModel.create({
			userId: demo._id.toString(),
			doctorId: doctor._id.toString(),
			userData: { name: demo.name, email: demo.email, image: demo.image, phone: demo.phone },
			doctorData,
			amount: doctor.fees,
			slotDate: item.date,
			slotTime: item.time,
			date: Date.now(),
			payment: item.paid,
			cancelled: item.cancelled,
		});
		created++;
	}
	console.log(`appointments: ${created} created for ${demo.email}`);
};

// Seeds a small demo inbox and a couple of schedule requests for the shared
// admin/staff portal. Matched by role+subject/type+date so re-runs are safe.
const seedPortalDemo = async () => {
	const day = 24 * 60 * 60 * 1000;
	const ago = (days) => new Date(Date.now() - days * day);
	const ahead = (days) => new Date(Date.now() + days * day).toISOString().slice(0, 10);

	const inbox = [
		{
			role: "admin",
			subject: "Weekly operations summary",
			body: "Bookings are up this week. Three doctors have updated their availability — review the doctor list before the weekend.",
			sender: "Clinic System",
			senderRole: "system",
			daysAgo: 1,
		},
		{
			role: "admin",
			subject: "Patient feedback: smooth booking",
			body: "A patient left a note saying the new online booking flow was quick and easy. Sharing with the team for visibility.",
			sender: "Demo Patient",
			senderRole: "patient",
			daysAgo: 3,
		},
		{
			role: "admin",
			subject: "Time-off request pending",
			body: "Dr. Richard James requested time off next week. Open the Schedule page to review the request.",
			sender: "Dr. Richard James",
			senderRole: "staff",
			daysAgo: 5,
		},
		{
			role: "staff",
			subject: "Your shift schedule is published",
			body: "Next week's clinic roster is available. Let the admin team know if any slot conflicts with your plans.",
			sender: "Clinic Coordinator",
			senderRole: "system",
			daysAgo: 1,
		},
		{
			role: "staff",
			subject: "Reminder: update your availability",
			body: "Please keep your availability current so patients only see bookable slots.",
			sender: "Clinic System",
			senderRole: "system",
			daysAgo: 4,
		},
	];
	for (const item of inbox) {
		await messageModel.updateOne(
			{ role: item.role, subject: item.subject },
			{
				$set: {
					body: item.body,
					sender: item.sender,
					senderRole: item.senderRole,
					createdAt: ago(item.daysAgo),
				},
				$setOnInsert: { role: item.role, subject: item.subject, read: false },
			},
			{ upsert: true }
		);
	}

	const staff = await doctorModel.findOne({ email: "richard.james@prescripto.com" });
	const requests = [
		{
			type: "time-off",
			requester: "Dr. Richard James",
			date: ahead(6),
			reason: "Annual leave — covering doctor arranged.",
		},
		{
			type: "schedule-change",
			requester: "Dr. Richard James",
			date: ahead(9),
			reason: "Prefer afternoon clinics on this day.",
		},
	];
	for (const item of requests) {
		await scheduleRequestModel.updateOne(
			{
				type: item.type,
				date: item.date,
				doctorId: staff ? staff._id.toString() : "demo-staff",
			},
			{
				$set: { requester: item.requester, reason: item.reason },
				$setOnInsert: {
					type: item.type,
					date: item.date,
					role: "staff",
					doctorId: staff ? staff._id.toString() : "demo-staff",
					status: "pending",
					createdAt: ago(2),
				},
			},
			{ upsert: true }
		);
	}
	console.log("portal demo messages and schedule requests ready");
};

// Orchestrates the full seed: connect, seed entities, print summary, then disconnect.
const seed = async () => {
	const ok = await connectDB();
	if (!ok) {
		console.error("Aborting seed: database is unreachable (fix MONGO_URI first).");
		process.exit(1);
	}

	await seedAdmin();
	const doctors = await seedDoctors();
	const users = await seedPatients();
	await seedAppointments(users, doctors);
	await seedPortalDemo();

	console.log("\nSeed complete.");
	console.log(`  admin:   ${process.env.ADMIN_EMAIL}  (password from ADMIN_PASSWORD)`);
	console.log(`  patient: demo@prescripto.com / ${DEMO_PASSWORD}`);
	console.log(`  photos:  ${API_URL}/static/doctors/...`);
	await mongoose.disconnect();
};

seed().catch(async (error) => {
	console.error("Seed failed:", error.message);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
