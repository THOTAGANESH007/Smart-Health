import express from "express";
import {
  createScheduledNotification,
  deleteScheduledNotification,
  getAllScheduledNotifications,
} from "../controllers/schedule.js";

const scheduleRouter = express.Router();

// Create a new scheduled notification
scheduleRouter.post("/", createScheduledNotification);

scheduleRouter.get("/all", getAllScheduledNotifications);

scheduleRouter.delete("/:id", deleteScheduledNotification);

export default scheduleRouter;
