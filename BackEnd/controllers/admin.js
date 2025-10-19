import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor.js";
import Receptionist from "../models/Receptionist.js";

// Create a new user (Admin only)
export const createUserByAdmin = async (req, res) => {
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

    res.status(201).json({
      message: `${role} user created successfully`,
      userId: user._id,
      redirectTo: `/api/admin/add-${role.toLowerCase()}-details/${user._id}`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

export const addDoctorDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      specialization,
      experience_years,
      contact_info,
      consultation_type,
      availability_schedule,
      rating,
    } = req.body;

    // Check if doctor details already exist
    const exists = await Doctor.findOne({ userId });
    if (exists)
      return res.status(400).json({ message: "Doctor details already exist" });

    // Create doctor details
    const doctor = await Doctor.create({
      userId,
      specialization,
      experience_years,
      contact_info,
      consultation_type,
      availability_schedule,
      rating,
    });

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

export const addReceptionistDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { assigned_doctor_id, contact_info } = req.body;

    // Check if receptionist details already exist
    const exists = await Receptionist.findOne({ userId });
    if (exists)
      return res
        .status(400)
        .json({ message: "Receptionist details already exist" });

    const receptionist = await Receptionist.create({
      userId,
      assigned_doctor_id,
      contact_info,
    });

    res.status(201).json({
      message: "Receptionist details added successfully",
      receptionist,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding receptionist details",
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

export const deleteReceptionist = async (req, res) => {
  try {
    const { userId } = req.params;

    const receptionist = await Receptionist.findOneAndDelete({ userId });
    if (!receptionist)
      return res.status(404).json({ message: "Receptionist not found" });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Receptionist and associated user deleted successfully",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting receptionist", error: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("userId", "name email phone role is_active")
      .exec();
    res.status(200).json({ doctors });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: err.message });
  }
};

export const getDoctorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const doctor = await Doctor.findOne({ userId })
      .populate("userId", "name email phone role is_active")
      .exec();

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ doctor });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctor", error: err.message });
  }
};

export const getAllReceptionists = async (req, res) => {
  try {
    const receptionists = await Receptionist.find()
      .populate("userId", "name email phone role is_active")
      .populate("assigned_doctor_id", "specialization")
      .exec();
    res.status(200).json({ receptionists });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching receptionists", error: err.message });
  }
};

export const getReceptionistByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const receptionist = await Receptionist.findOne({ userId })
      .populate("userId", "name email phone role is_active")
      .populate("assigned_doctor_id", "specialization")
      .exec();

    if (!receptionist)
      return res.status(404).json({ message: "Receptionist not found" });

    res.status(200).json({ receptionist });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching receptionist", error: err.message });
  }
};
