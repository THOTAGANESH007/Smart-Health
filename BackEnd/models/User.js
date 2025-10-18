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
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
