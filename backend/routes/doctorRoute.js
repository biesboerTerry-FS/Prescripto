import express from "express";

// Public doctor routes used by the patient site and mobile app.
import { doctorList } from "../controllers/doctorController.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);

export default doctorRouter;
