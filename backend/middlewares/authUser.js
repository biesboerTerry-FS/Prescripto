import jwt from "jsonwebtoken";

/**
 * Protects patient routes by verifying a JWT.
 * Accepts either a custom `token` header or a standard `Authorization: Bearer <jwt>` header
 * (handy for OAuth/mobile clients). On success it attaches the user id to `request.body.userId`
 * so downstream handlers know who is making the request.
 */
const authUser = async (request, response, next) => {
	try {
		// accept the app's `token` header, or a standard
		// `Authorization: Bearer <jwt>` header (used by OAuth/mobile clients)
		const authHeader = request.headers.authorization || "";
		const token =
			request.headers.token ||
			(authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");
		if (!token) {
			return response.json({
				success: false,
				message: "Not authorized.",
			});
		}

		const token_decode = jwt.verify(token, process.env.JWT_SECRET);
		request.body.userId = token_decode.id;

		next();
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export default authUser;
