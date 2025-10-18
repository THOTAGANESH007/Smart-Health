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
    disease_details: String,
    blood_group: String,
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
