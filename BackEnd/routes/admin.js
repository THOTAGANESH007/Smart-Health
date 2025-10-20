import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  addDoctorDetails,
  addReceptionistDetails,
  createUserByAdmin,
  deleteDoctor,
  deleteReceptionist,
  getAllDoctors,
  getAllReceptionists,
  getDoctorByUserId,
  getReceptionistByUserId,
} from "../controllers/admin.js";

const adminRouter = express.Router();

// Admin creates new user
adminRouter.post(
  "/create-user",
  protect,
  authorize("ADMIN"),
  createUserByAdmin
);

// Admin creates doctors and receptionists
adminRouter.post(
  "/add-doctor-details/:userId",
  protect,
  authorize("ADMIN"),
  addDoctorDetails
);

adminRouter.post(
  "/add-receptionist-details/:userId",
  protect,
  authorize("ADMIN"),
  addReceptionistDetails
);

adminRouter.delete(
  "/delete-doctor/:userId",
  protect,
  authorize("ADMIN"),
  deleteDoctor
);
adminRouter.delete(
  "/delete-receptionist/:userId",
  protect,
  authorize("ADMIN"),
  deleteReceptionist
);

adminRouter.get("/getAllDoctors", protect, getAllDoctors);
adminRouter.get(
  "/doctors/:userId",
  protect,
  authorize("ADMIN"),
  getDoctorByUserId
);

adminRouter.get(
  "/getAllReceptionists",
  protect,
  authorize("ADMIN"),
  getAllReceptionists
);
adminRouter.get(
  "/receptionists/:userId",
  protect,
  authorize("ADMIN"),
  getReceptionistByUserId
);

export default adminRouter;
