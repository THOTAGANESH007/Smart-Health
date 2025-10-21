import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    senderRole: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "RECEPTIONIST"],
    }, // optional
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
