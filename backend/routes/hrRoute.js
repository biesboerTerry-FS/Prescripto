import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import { ensureHRSeeded } from "../configs/hrDemo.js";
import {
	listStaff,
	staffDetail,
	addStaff,
	updateStaff,
	setStaffStatus,
	listDepartments,
	addDepartment,
	updateDepartment,
	deleteDepartment,
	listRoles,
	addRole,
	updateRole,
	deleteRole,
	listPayruns,
	runPayroll,
	listNotes,
	addNote,
	listTimeOff,
	reviewTimeOff,
	summary,
} from "../controllers/hrController.js";

// Admin-only HR suite. Every route requires an admin JWT; public doctor
// browsing and doctor login routes are deliberately left untouched.
const hrRouter = express.Router();
hrRouter.use(authAdmin);
// Make the portfolio demo data available in the database on first use. The
// seed upserts by natural key, so it is safe even across warm serverless runs.
hrRouter.use(async (_request, _response, next) => {
	try {
		await ensureHRSeeded();
	} catch (error) {
		console.error("HR seed middleware:", error.message);
	}
	next();
});

hrRouter.get("/summary", summary);

hrRouter.get("/staff", listStaff);
hrRouter.get("/staff/:id", staffDetail);
hrRouter.post("/staff", addStaff);
hrRouter.put("/staff/:id", updateStaff);
hrRouter.patch("/staff/:id/status", setStaffStatus);

hrRouter.get("/departments", listDepartments);
hrRouter.post("/departments", addDepartment);
hrRouter.put("/departments/:id", updateDepartment);
hrRouter.delete("/departments/:id", deleteDepartment);

hrRouter.get("/roles", listRoles);
hrRouter.post("/roles", addRole);
hrRouter.put("/roles/:id", updateRole);
hrRouter.delete("/roles/:id", deleteRole);

hrRouter.get("/payroll", listPayruns);
hrRouter.post("/payroll/run", runPayroll);

hrRouter.get("/notes", listNotes);
hrRouter.post("/notes", addNote);

hrRouter.get("/time-off", listTimeOff);
hrRouter.patch("/time-off/:id", reviewTimeOff);

export default hrRouter;
