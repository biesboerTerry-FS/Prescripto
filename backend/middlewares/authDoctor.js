import jwt from "jsonwebtoken";

/**
 * Protects doctor routes. Expects a `doctortoken` header containing a JWT with
 * `role: "doctor"` (issued by the doctor login flow). On success the decoded
 * doctor id is attached to request.doctorId (and request.body.doctorId).
 */
const authDoctor = async (request, response, next) => {
	try {
		const { doctortoken } = request.headers;
		if (!doctortoken) {
			return response.status(401).json({
				success: false,
				message: "Not authorized",
			});
		}

		const decoded = jwt.verify(doctortoken, process.env.JWT_SECRET);
		if (!decoded || decoded.role !== "doctor" || !decoded.id) {
			return response.status(401).json({
				success: false,
				message: "Not authorized",
			});
		}

		request.doctorId = decoded.id;
		request.body.doctorId = decoded.id;
		next();
	} catch (error) {
		console.log(error);
		response.status(401).json({
			success: false,
			message: "Not authorized",
		});
	}
};

export default authDoctor;
