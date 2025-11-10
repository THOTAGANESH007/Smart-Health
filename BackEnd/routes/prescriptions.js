import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createPrescription,
  downloadPrescription,
  getAllPrescriptions,
  // downloadPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
} from "../controllers/prescriptions.js";
const prescriptionRouter = express.Router();

// Only doctor can create a prescription
prescriptionRouter.post("/create/:patientId", protect, createPrescription);

// Get all prescriptions of a patient
prescriptionRouter.get(
  "/getAllPrescriptions/:patientId",
  protect,
  getPatientPrescriptions
);

// View single prescription by ID
prescriptionRouter.get(
  "/getPrescription/:prescriptionId",
  protect,
  getPrescriptionById
);

// Download prescription PDF
prescriptionRouter.get(
  "/download/:prescriptionId",
  protect,
  downloadPrescription
);

// Get All Prescriptions
prescriptionRouter.get("/all", protect, getAllPrescriptions);

export default prescriptionRouter;
