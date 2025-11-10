import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  sendNotification,
  getAll,
} from "../controllers/notifications.js";

const notificationRouter = express.Router();

// Admin
notificationRouter.post(
  "/send",
  protect,
  authorize("ADMIN", "RECEPTIONIST", "DOCTOR"),
  sendNotification
);

// User
notificationRouter.get("/", protect, getAllNotifications);
notificationRouter.patch("/mark-read/:id", protect, markAsRead);
notificationRouter.delete("/:id", protect, deleteNotification);
notificationRouter.patch("/mark-all-read", protect, markAllAsRead);
notificationRouter.get("/get-all-notifications", protect, getAll); 

export default notificationRouter;
