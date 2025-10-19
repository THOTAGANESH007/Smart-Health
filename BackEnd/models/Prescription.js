import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  medicine_name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., 500mg
  frequency: { type: String, required: true }, // e.g., twice daily
  duration: { type: String, required: true }, // e.g., 5 days
  route: { type: String, default: "oral" }, // oral, topical, injection
  instructions: { type: String }, // before/after food, etc.
});

const prescriptionSchema = new mongoose.Schema(
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
    prescription_date: { type: Date, default: Date.now },
    diagnosis: { type: String, required: true },
    medications: [medicationSchema],
    precautions: [{ type: String }],
    signed: { type: Boolean, default: false },
    file_url: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
