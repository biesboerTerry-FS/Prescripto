import jwt from "jsonwebtoken";

/**
 * Protects admin routes. Expects an `admintoken` header containing a JWT with `role: "admin"`
 * (issued by the admin login flow). Requests without a valid admin token are rejected.
 */
const authAdmin = async (request, response, next) => {
	try {
		// verify token
		const { admintoken } = request.headers;
		if (!admintoken) {
			return response.json({
				success: false,
				message: "Not authorized",
			});
		}

		// decode token; admin tokens carry role "admin" (see loginAdmin)
		const token_decode = jwt.verify(admintoken, process.env.JWT_SECRET);

		if (!token_decode || token_decode.role !== "admin") {
			return response.json({
				success: false,
				message: "Not authorized",
			});
		}

		next();
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export default authAdmin;
