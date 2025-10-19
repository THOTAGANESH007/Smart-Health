import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  type: { type: String, enum: ["APPOINTMENT","PRESCRIPTION","REMINDER","SYSTEM","HEALTH_TIP"] },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
