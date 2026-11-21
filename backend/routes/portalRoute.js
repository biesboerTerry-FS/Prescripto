import express from "express";
import authAdminOrDoctor from "../middlewares/authAdminOrDoctor.js";
import {
	getMessages,
	postMessage,
	markMessageRead,
	getScheduleRequests,
	postScheduleRequest,
	reviewScheduleRequest,
} from "../controllers/portalController.js";

// Shared admin/staff portal endpoints. Every route is JWT protected: the
// middleware identifies the role and the controller applies the finer checks.
const portalRouter = express.Router();

portalRouter.get("/messages", authAdminOrDoctor, getMessages);
portalRouter.post("/messages", authAdminOrDoctor, postMessage);
portalRouter.patch("/messages/:id/read", authAdminOrDoctor, markMessageRead);

portalRouter.get("/schedule-requests", authAdminOrDoctor, getScheduleRequests);
portalRouter.post("/schedule-requests", authAdminOrDoctor, postScheduleRequest);
portalRouter.patch("/schedule-requests/:id", authAdminOrDoctor, reviewScheduleRequest);

export default portalRouter;
