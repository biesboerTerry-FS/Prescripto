// Seeds the admin-only HR demo data (safe to re-run; matched by natural keys).
//
//   node seed-hr.js   (or: npm run seed:hr)
//
// Enriches eight of the sixty seeded doctors with HR metadata and adds
// departments, role labels, pay runs, performance notes and time-off requests.
// The same data is seeded automatically on the first admin HR API call, so
// this script is only needed to seed ahead of time. It never touches login
// credentials, photos or booking availability.
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./configs/mongoDB.js";
import { seedHRTables } from "./configs/hrDemo.js";

const seed = async () => {
	const ok = await connectDB();
	if (!ok) {
		console.error("Aborting HR seed: database is unreachable (fix MONGO_URI first).");
		process.exit(1);
	}
	const counts = await seedHRTables();
	console.log("HR seed complete.");
	console.log(`  departments: ${counts.departments}`);
	console.log(`  role labels: ${counts.roles}`);
	console.log(`  enriched staff: ${counts.staff}`);
	console.log(`  pay runs: ${counts.payruns}`);
	console.log(`  performance notes: ${counts.notes}`);
	console.log(`  time-off requests: ${counts.timeOff}`);
	await mongoose.disconnect();
};

seed().catch(async (error) => {
	console.error("HR seed failed:", error.message);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
