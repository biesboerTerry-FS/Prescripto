import jwt from "jsonwebtoken";

/**
 * Protects admin routes. Expects an `admintoken` header containing a JWT with
 * `role: "admin"` (issued by the admin login flow).
 *
 * Signature and expiry are verified with the secret from the environment.
 * Invalid, expired, malformed and missing tokens all produce the same generic
 * 401 — the token and the verification error are never echoed to the client or
 * written to the logs.
 */
const authAdmin = (request, response, next) => {
	const deny = () => response.status(401).json({ success: false, message: "Not authorized" });

	const token = request.headers.admintoken;
	const secret = process.env.JWT_SECRET;
	if (typeof token !== "string" || !token.trim() || !secret) {
		return deny();
	}

	try {
		const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
		if (!decoded || decoded.role !== "admin") {
			return deny();
		}
		request.admin = { role: "admin", email: decoded.email };
		next();
	} catch {
		// jwt.verify throws for bad signatures, expired tokens and malformed
		// input. Treat every failure identically and keep the reason private.
		return deny();
	}
};

export default authAdmin;
