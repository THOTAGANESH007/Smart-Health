import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isRead: { type: Boolean, default: false },
});

const scheduledNotificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  recipients: [recipientSchema],
  sendToAll: { type: Boolean, default: false },
  scheduledTime: { type: Date, required: true },
  isSent: { type: Boolean, default: false },
});

export default mongoose.model(
  "ScheduledNotification",
  scheduledNotificationSchema
);
