import mongoose from "mongoose";

/**
 * Connects to MongoDB using MONGO_URI and appends the `prescripto` database name.
 * Returns true/false instead of throwing so the server can stay up and report DB state.
 */
const connectDB = async () => {
	// NOTE: the event name is "connected" (lowercase). The previous code
	// listened for "Connected", so the success log never fired.
	mongoose.connection.on("connected", () =>
		console.log("Database connected")
	);
	mongoose.connection.on("disconnected", () =>
		console.warn("Database disconnected")
	);
	mongoose.connection.on("error", (error) =>
		console.error("Database connection error:", error.message)
	);

	const rawUri = process.env.MONGO_URI?.trim();
	if (!rawUri) {
		console.error(
			"MONGO_URI is not set. Check backend/.env (see backend/.env.example)."
		);
		return false;
	}

	// Normalize: strip surrounding quotes/whitespace (guards against
	// copy-pasted values like MONGO_URI = "mongodb+srv://...") and
	// trailing slashes, then append the database name once.
	const cleanedUri = rawUri.replace(/^["']|["']$/g, "").replace(/\/+$/, "");
	const uri = cleanedUri.endsWith("/prescripto")
		? cleanedUri
		: `${cleanedUri}/prescripto`;

	try {
		await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
		return true;
	} catch (error) {
		console.error(
			`Failed to connect to MongoDB: ${error.message}\n` +
				"Tips: verify MONGO_URI in backend/.env, that the Atlas cluster is\n" +
				"not paused/deleted, and that your IP is allowlisted (Atlas > Network Access)."
		);
		return false;
	}
};

export default connectDB;
