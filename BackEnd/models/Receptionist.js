import mongoose from "mongoose";

const receptionistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    contact_info: String,
  },
  { timestamps: true }
);

export default mongoose.model("Receptionist", receptionistSchema);
