import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    age: Number,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHERS"] },
    address: String,
    disease_details: {
      bp: {
        type: String,
        enum: ["HIGH", "NORMAL", "LOW"],
        default: "NORMAL",
      },
      diabetes: {
        type: String,
        enum: ["YES", "NO"],
        default: "NO",
      },
      heart_disease: {
        type: String,
        enum: ["YES", "NO"],
        default: "NO",
      },
      asthma: {
        type: String,
        enum: ["YES", "NO"],
        default: "NO",
      },
    },
    blood_group: String,
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
