import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  sendNotification,
} from "../controllers/notifications.js";

const notificationRouter = express.Router();

// Admin
notificationRouter.post("/send", protect, authorize("ADMIN"), sendNotification);

// User
notificationRouter.get("/", protect, getNotifications);
notificationRouter.patch("/mark-read/:id", protect, markAsRead);
notificationRouter.delete("/:id", protect, deleteNotification);
notificationRouter.patch("/mark-all", protect, markAllAsRead);

export default notificationRouter;
