import express from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  resetForgotPassword,
  saveFCMtoken,
  signin,
  signout,
  signup,
  updateUserDetails,
  uploadProfile,
  verifyForgotPasswordOtp,
} from "../controllers/authController.js";
import upload from "../middlewares/multer.js";
import { protect } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

// Authentication Routes
authRouter.post(
  "/signup",
  [body("role").isIn(["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN"])],
  signup
);
authRouter.post("/signin", signin);
authRouter.post("/signout", protect, signout);

// User Profile Routes
authRouter.put("/update-user", protect, updateUserDetails);

// Profile Image Upload Route
authRouter.put(
  "/upload-profile",
  protect,
  upload.single("image"),
  uploadProfile
);

// Forgot and Reset Password Routes
authRouter.put("/forgot-password", forgotPassword);
authRouter.put("/verify-forgot-password-otp", verifyForgotPasswordOtp);
authRouter.put("/reset-password", resetForgotPassword);

authRouter.post("/save-fcm-token", protect, saveFCMtoken);
export default authRouter;
