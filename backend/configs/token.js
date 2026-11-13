import jwt from "jsonwebtoken";

// Centralized JWT creation so every login path (local, OAuth, refresh, admin)
// issues tokens the same way. Tokens are signed with JWT_SECRET and expire
// after JWT_EXPIRES_IN (default 7 days) instead of never expiring.
const getExpiry = () => process.env.JWT_EXPIRES_IN || "7d";

/** Creates a signed JWT for a patient/user id with the configured expiry. */
export const createToken = (userId) =>
	jwt.sign({ id: userId }, process.env.JWT_SECRET, {
		expiresIn: getExpiry(),
	});

// Admin tokens carry a role claim instead of credentials.
/** Creates a signed JWT for an admin session, including a role claim for authorization checks. */
export const createAdminToken = (email) =>
	jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
		expiresIn: getExpiry(),
	});

/** Verifies and decodes a JWT using the shared secret (throws if invalid/expired). */
export const verifyToken = (token) =>
	jwt.verify(token, process.env.JWT_SECRET);
