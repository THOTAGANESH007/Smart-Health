import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor.js";
import Receptionist from "../models/Receptionist.js";
import Patient from "../models/Patient.js";

// Create a new user (Admin only)
export const createUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      name,
      email,
      phone,
      role,
      password_hash,
    });
    req.userId = user._id;
    // res.status(201).json({
    //   message: `${role} user created successfully`,
    //   userId: user._id,
    //   redirectTo: `/api/admin/add-${role.toLowerCase()}-details/${user._id}`,
    // });
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

export const addDoctorDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { specialization, experience_years, consultation_type } = req.body;

    // Check if doctor details already exist
    const exists = await Doctor.findOne({ userId });
    if (exists)
      return res.status(400).json({ message: "Doctor details already exist" });

    // Create doctor details
    const doctor = await Doctor.create({
      userId,
      specialization,
      experience_years,
      consultation_type,
    });

    await User.updateOne({ _id: userId }, { doctorId: doctor._id });

    res.status(201).json({
      message: "Doctor details added successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding doctor details",
      error: err.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { userId } = req.params;

    const doctor = await Doctor.findOneAndDelete({ userId });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ message: "Doctor and associated user deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting doctor", error: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("specialization experience_years consultation_type rating")
      .populate("userId", "name email phone role is_active profile")
      .exec();
    res.status(200).json({ doctors });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: err.message });
  }
};

export const getAllPatientsHealthCards = async (req, res) => {
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

export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { specialization, experience_years, consultation_type } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update doctor details
    if (specialization) doctor.specialization = specialization;
    if (experience_years) doctor.experience_years = experience_years;
    if (consultation_type) doctor.consultation_type = consultation_type;

    await doctor.save();

    res.status(200).json({
      message: "Doctor details updated successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating doctor details",
      error: err.message,
    });
  }
};
