import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: String,
    experience_years: Number,
    contact_info: String,
    consultation_type: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "BOTH"],
      default: "BOTH",
    },
    availability_schedule: { type: Object },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
