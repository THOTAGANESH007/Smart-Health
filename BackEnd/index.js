import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import connectDB from "./config/connectDB.js";
import patientsRouter from "./routes/patients.js";
import adminRouter from "./routes/admin.js";
import appointmentRouter from "./routes/appointments.js";
import feedbackRouter from "./routes/feedback.js";
import prescriptionRouter from "./routes/prescriptions.js";

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS config (allow frontend to communicate)
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/prescriptions", prescriptionRouter);
// Test route
// app.get("/", (req, res) => {
//   res.send("SMART HEALTH API is running!");
// });

// MongoDB connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));
