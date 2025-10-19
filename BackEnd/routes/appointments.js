import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} from "../controllers/appointments.js";
import { protect } from "../middlewares/authMiddleware.js";
const appointmentRouter = express.Router();

appointmentRouter.post("/:doctorId", protect, createAppointment); // Logged-in patient creates appointment
appointmentRouter.get("/getAllAppointments", protect, getAllAppointments); // For Admin/Receptionist
appointmentRouter.get("/getDoctorAppointments", protect, getDoctorAppointments); // Logged-in doctor
appointmentRouter.get(
  "/getPatientAppointments",
  protect,
  getPatientAppointments
); // Logged-in patient
appointmentRouter.put(
  "/:appointmentId/status",
  protect,
  updateAppointmentStatus
);

export default appointmentRouter;
