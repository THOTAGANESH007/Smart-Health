import mongoose from "mongoose";

const scheduledNotificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  recipients: [mongoose.Schema.Types.ObjectId],
  sendToAll: { type: Boolean, default: false },
  scheduledTime: { type: Date, required: true },
  isSent: { type: Boolean, default: false },
});

export default mongoose.model(
  "ScheduledNotification",
  scheduledNotificationSchema
);
