import doctorModel from "../models/doctorModel.js";

/**
 * Toggles a doctor's availability flag. The admin panel uses this to open/close booking.
 */
const changeAvailability = async (request, response) => {
	try {
		const { doctorId } = request.body;
		const doctorData = await doctorModel.findById(doctorId);

		await doctorModel.findByIdAndUpdate(doctorId, {
			available: !doctorData.available,
		});
		response.json({
			success: true,
			message: "Availability updated",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Returns the public list of doctors for the patient site, omitting sensitive fields.
 */
const doctorList = async (request, response) => {
	try {
		const doctors = await doctorModel
			.find({})
			.select(["-password", "-email"]);
		response.json({
			success: true,
			doctors,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export { changeAvailability, doctorList };
