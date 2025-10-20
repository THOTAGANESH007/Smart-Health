import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  test_name: { type: String, required: true },
  result: { type: String },
  normal_range: { type: String },
  units: { type: String },
  remarks: { type: String },
});

const labTestSchema = new mongoose.Schema(
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
    test_date: { type: Date, default: Date.now },
    diagnosis: { type: String },
    test_results: [testResultSchema],
    remarks: { type: String },
    file_url: { type: String }, // PDF report link
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LabTest", labTestSchema);
