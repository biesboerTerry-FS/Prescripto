import jwt from "jsonwebtoken";

/**
 * Allows either an admin (`admintoken`) or a doctor/staff (`doctortoken`) JWT.
 * Used by the shared portal endpoints; the controller still applies the finer
 * checks (e.g. staff may only touch their own appointments/requests).
 *
 * Same guarantees as the single-role middlewares: HS256 only, signature and
 * expiry verified, and one generic 401 with no token/error leakage.
 */
const deny = (response) =>
	response.status(401).json({ success: false, message: "Not authorized" });

const verify = (token, secret, role) => {
	try {
		const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
		if (decoded && decoded.role === role) return decoded;
	} catch {
		// fall through — the caller tries the other role
	}
	return null;
};

const authAdminOrDoctor = (request, response, next) => {
	const secret = process.env.JWT_SECRET;
	if (!secret) return deny(response);

	const adminToken = request.headers.admintoken;
	const doctorToken = request.headers.doctortoken;

	if (typeof adminToken === "string" && adminToken.trim()) {
		const decoded = verify(adminToken, secret, "admin");
		if (decoded) {
			request.actor = { role: "admin", id: null, email: decoded.email };
			return next();
		}
	}
	if (typeof doctorToken === "string" && doctorToken.trim()) {
		const decoded = verify(doctorToken, secret, "doctor");
		if (decoded && decoded.id) {
			request.actor = { role: "staff", id: decoded.id, email: null };
			return next();
		}
	}
	return deny(response);
};

export default authAdminOrDoctor;
