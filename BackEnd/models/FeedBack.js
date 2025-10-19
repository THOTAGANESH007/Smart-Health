import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, default: "" },
    sentiment: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      default: "NEUTRAL",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
