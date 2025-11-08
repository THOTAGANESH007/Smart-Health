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
    consultation_type: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "BOTH"],
      default: "BOTH",
    },
    rating: { type: Number, default: 0 }, // average rating
    feedbackCount: { type: Number, default: 0 }, // number of feedbacks
    totalRating: { type: Number, default: 0 }, // sum of all ratings
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
