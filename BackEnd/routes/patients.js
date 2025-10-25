import express from "express";
import {
  deletePatient,
  getAllPatients,
  getAllUsers,
  getPatientById,
  updatePatient,
} from "../controllers/patients.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";
const patientsRouter = express.Router();

patientsRouter.get("/get-patient/:id", protect, getPatientById);

patientsRouter.get(
  "/getall-patients",
  protect,
  authorize("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getAllPatients
);
patientsRouter.put(
  "/update-patient/:id",
  protect,
  authorize("PATIENT", "RECEPTIONIST"),
  updatePatient
);
patientsRouter.delete(
  "/delete-patient/:id",
  protect,
  authorize("ADMIN"),
  deletePatient
);
patientsRouter.get("/getAllUsers", getAllUsers);
export default patientsRouter;
