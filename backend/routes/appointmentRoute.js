import express from "express";
import authAdminOrDoctor from "../middlewares/authAdminOrDoctor.js";
import { updateOrderStatus } from "../controllers/portalController.js";

// Order fulfilment: admins may advance any booking, staff only their own.
const appointmentRouter = express.Router();

appointmentRouter.patch("/:id/status", authAdminOrDoctor, updateOrderStatus);

export default appointmentRouter;
