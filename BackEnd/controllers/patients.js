import Patient from "../models/Patient.js";
import User from "../models/User.js";

// Update patient details
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { age, gender, address, disease_details, blood_group } = req.body;

    // Find the patient by ID
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update fields only if provided
    if (age !== undefined) patient.age = age;
    if (gender !== undefined) patient.gender = gender;
    if (address !== undefined) patient.address = address;
    if (disease_details !== undefined)
      patient.disease_details = disease_details;
    if (blood_group !== undefined) patient.blood_group = blood_group;

    // Save updated patient
    const updatedPatient = await patient.save();

    res.status(200).json({
      message: "Patient details updated successfully",
      data: updatedPatient,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating patient details",
      error: err.message,
    });
  }
};

// Get all patients with populated user details
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("userId", "name email phone profile")
      .select("age gender address disease_details blood_group createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ patients });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a specific patient with populated user details
export async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate(
      "userId",
      "name email phone role"
    );

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.status(200).json(patient);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Delete patient (deletes both Patient and linked User)
export async function deletePatient(req, res) {
  try {
    const { id } = req.params; // this is the Patient _id, not userId

    // Find the patient by Patient ID first
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Delete both patient and the linked user
    await User.findByIdAndDelete(patient.userId);
    await Patient.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Patient and linked user deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const patients = await User.find().select("_id name email phone role");
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
