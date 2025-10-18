import express from "express";
import { body } from "express-validator";
import { signin, signout, signup } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  [body("role").isIn(["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN"])],
  signup
);

authRouter.post("/signin", signin);
authRouter.post("/signout", signout);

export default authRouter;
