import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  addDoctorDetails,
  createUserByAdmin,
  deleteDoctor,
  getAllDoctors,
  getAllPatientsHealthCards,
  updateDoctor,
} from "../controllers/admin.js";

const adminRouter = express.Router();

// Admin creates new user
adminRouter.post(
  "/create-user",
  protect,
  authorize("ADMIN"),
  createUserByAdmin,
  addDoctorDetails
);

adminRouter.delete(
  "/delete-doctor/:userId",
  protect,
  authorize("ADMIN"),
  deleteDoctor
);

adminRouter.get("/getAllDoctors", protect, getAllDoctors);

adminRouter.get(
  "/get-all-patients-health-cards",
  protect,
  authorize("ADMIN", "DOCTOR"),
  getAllPatientsHealthCards
);

adminRouter.patch("/update-doctor/:doctorId", protect, authorize("ADMIN"),updateDoctor);
export default adminRouter;
