import express from "express";

// Public doctor routes used by the patient site and mobile app, plus doctor auth.
import {
	doctorList,
	loginDoctor,
	getDoctorProfile,
	getDoctorAppointments,
	setDoctorAvailability,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/me", authDoctor, getDoctorProfile);
doctorRouter.get("/appointments", authDoctor, getDoctorAppointments);
doctorRouter.post("/availability", authDoctor, setDoctorAvailability);

export default doctorRouter;
