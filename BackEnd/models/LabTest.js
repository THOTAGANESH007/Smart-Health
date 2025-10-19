import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  test_name: String,
  scheduled_date: Date,
  status: { type: String, enum: ["PENDING","IN_PROGRESS","COMPLETED"], default: "PENDING" },
  report_url: String
}, { timestamps: true });

export default mongoose.model("LabTest", labTestSchema);
