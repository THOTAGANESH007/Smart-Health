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

    // Update basic fields if provided
    if (age !== undefined) patient.age = age;
    if (gender !== undefined) patient.gender = gender;
    if (address !== undefined) patient.address = address;
    if (blood_group !== undefined) patient.blood_group = blood_group;

    // Safely handle disease_details merge
    if (disease_details && typeof disease_details === "object") {
      const validDiseaseFields = {
        bp: ["HIGH", "NORMAL", "LOW"],
        diabetes: ["YES", "NO"],
        heart_disease: ["YES", "NO"],
        asthma: ["YES", "NO"],
      };

      for (const [key, value] of Object.entries(disease_details)) {
        if (
          validDiseaseFields[key] &&
          validDiseaseFields[key].includes(value.toUpperCase())
        ) {
          patient.disease_details[key] = value.toUpperCase();
        }
      }
    }

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
    const { id } = req.params; // Patient _id

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Delete both patient and linked user
    await User.findByIdAndDelete(patient.userId);
    await Patient.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Patient and linked user deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Get all users
export async function getAllUsers(req, res) {
  try {
    const patients = await User.find().select("_id name email phone role");
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Get Patient Health Card
export async function getPatientHealthCard(req, res) {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .select("age gender address disease_details blood_group userId")
      .populate("userId", "name email phone profile");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Patient health card retrieved successfully",
      data: patient,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
