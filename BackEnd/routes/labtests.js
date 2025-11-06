import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  completeLabTest,
  getPatientLabTests,
  getLabTestById,
  // downloadLabReport,
  createLabTest,
  downloadLabReport,
  getAllLabTests,
} from "../controllers/labtests.js";

const labRouter = express.Router();

// Doctor creates a lab test
labRouter.post("/create/:patientId", protect, createLabTest);

// Lab technician completes a lab test
labRouter.put("/complete/:labTestId", protect, completeLabTest);

// Get all lab tests of a patient
labRouter.get("/patient/:patientId", protect, getPatientLabTests);

// Get single lab test
labRouter.get("lab/:labTestId", protect, getLabTestById);

// Download PDF
labRouter.get("/download/:labTestId", protect, downloadLabReport);

// Get all lab tests (for admin/doctor)
labRouter.get("/all", protect, getAllLabTests);

export default labRouter;
