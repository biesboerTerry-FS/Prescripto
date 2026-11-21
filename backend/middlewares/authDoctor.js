import jwt from "jsonwebtoken";

/**
 * Protects doctor routes. Expects a `doctortoken` header containing a JWT with
 * `role: "doctor"` and an `id` claim (issued by the doctor login flow).
 *
 * Signature and expiry are verified with the secret from the environment.
 * Failures return one generic 401 and are never logged, so tokens and verifier
 * error details cannot leak into responses or server logs.
 */
const authDoctor = (request, response, next) => {
	const deny = () => response.status(401).json({ success: false, message: "Not authorized" });

	const token = request.headers.doctortoken;
	const secret = process.env.JWT_SECRET;
	if (typeof token !== "string" || !token.trim() || !secret) {
		return deny();
	}

	try {
		const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
		if (!decoded || decoded.role !== "doctor" || !decoded.id) {
			return deny();
		}
		request.doctorId = decoded.id;
		request.body = request.body || {};
		request.body.doctorId = decoded.id;
		next();
	} catch {
		return deny();
	}
};

export default authDoctor;
