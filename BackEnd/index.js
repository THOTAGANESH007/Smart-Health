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
import labRouter from "./routes/labtests.js";
import notificationRouter from "./routes/notifications.js";
import { initSocket } from "./video.js";
import http from "http";
import scheduleRouter from "./routes/scheduleRoutes.js";
import startScheduler from "./scheduler.js";

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173", // for local development
  "https://smart-health-major.vercel.app", // for deployed frontend
  "https://localhost:7777"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman) or those in allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allows sending cookies or authorization headers
  })
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/prescriptions", prescriptionRouter);
app.use("/api/labtests", labRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/schedule", scheduleRouter);
// Test route
// app.get("/", (req, res) => {
//   res.send("SMART HEALTH API is running!");
// });

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO from separate file
initSocket(server);

// MongoDB connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    startScheduler();
  })
  .catch((err) => console.log("MongoDB connection error:", err));
