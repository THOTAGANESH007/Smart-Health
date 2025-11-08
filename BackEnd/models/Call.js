import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
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
    roomId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "ended"],
      default: "pending",
    },
    callStartedAt: {
      type: Date,
      default: Date.now,
    },
    callEndedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Call", callSchema);
