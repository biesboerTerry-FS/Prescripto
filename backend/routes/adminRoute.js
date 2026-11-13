import express from "express";

// Admin-only API routes protected by the admin auth middleware.
import {
	addDoctor,
	allDoctors,
	loginAdmin,
	adminDashboard,
	allAppointments,
	adminCancelAppointment,
	allPatients,
	patientDetails,
} from "../controllers/adminController.js";
import { changeAvailability } from "../controllers/doctorController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/appointments", authAdmin, allAppointments);
adminRouter.put("/cancel-appointment", authAdmin, adminCancelAppointment);
adminRouter.get("/patients", authAdmin, allPatients);
adminRouter.get("/patients/:patientId", authAdmin, patientDetails);

export default adminRouter;
