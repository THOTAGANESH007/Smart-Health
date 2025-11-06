import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password_hash: {
      type: String,
      required: true,
    },
    phone: { type: String },
    role: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"],
      required: true,
      default: "PATIENT",
    },
    is_active: { type: Boolean, default: true },
    profile: { type: String, default: "" },
    forgot_password_otp: { type: String, default: null },
    forgot_password_expired: { type: Date, default: "" },
    fcmToken: { type: String, default: null }, // Field for FCM token (firebase cloud messaging)
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    receptionistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receptionist",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
