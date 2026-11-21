import jwt from "jsonwebtoken";

/**
 * Protects patient routes by verifying a JWT signed with JWT_SECRET.
 * Accepts the app's `token` header or a standard `Authorization: Bearer <jwt>`
 * header (used by the Clerk bridge and mobile clients).
 *
 * The decoded user id is attached to `request.userId` and `request.body.userId`
 * for downstream handlers. Tokens explicitly issued for another role (doctor or
 * admin) are rejected so a privileged token cannot be reused as a patient token.
 * Legacy patient tokens without a role claim are still accepted.
 *
 * Signature, algorithm and expiry are all checked. Failures return one generic
 * 401; the token and verification error are never logged or echoed back.
 */
const authUser = (request, response, next) => {
	const deny = () => response.status(401).json({ success: false, message: "Not authorized" });

	const authHeader = request.headers.authorization || "";
	const token =
		request.headers.token ||
		(authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");
	const secret = process.env.JWT_SECRET;
	if (typeof token !== "string" || !token.trim() || !secret) {
		return deny();
	}

	try {
		const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
		if (
			!decoded ||
			!decoded.id ||
			(decoded.role !== undefined && decoded.role !== "user")
		) {
			return deny();
		}
		request.userId = decoded.id;
		request.body = request.body || {};
		request.body.userId = decoded.id;
		next();
	} catch {
		return deny();
	}
};

export default authUser;
