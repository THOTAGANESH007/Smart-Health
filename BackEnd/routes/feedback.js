import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  addFeedback,
  getDoctorFeedback,
  getPatientFeedback,
} from "../controllers/feedback.js";

const feedbackRouter = express.Router();

// Add or update feedback for an appointment (patient only)
feedbackRouter.post(
  "/:doctorId/:appointmentId",
  protect,
  authorize("PATIENT"),
  addFeedback
);

// Get all feedbacks for a doctor
feedbackRouter.get("/doctor/:doctorId", getDoctorFeedback);

// Get all feedbacks submitted by logged-in patient
feedbackRouter.get(
  "/my-feedbacks",
  protect,
  authorize("PATIENT"),
  getPatientFeedback
);

export default feedbackRouter;
