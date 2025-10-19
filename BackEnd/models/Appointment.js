import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
    scheduled_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    // booked_by: {
    //   type: String,
    //   enum: ["PATIENT", "RECEPTIONIST"],
    //   default: "PATIENT",
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
