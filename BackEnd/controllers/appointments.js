import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

// Create appointment by the logged-in patient
export const createAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { scheduled_date, message } = req.body;
    const patientId = req.user.patientId;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      scheduled_date,
      message,
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating appointment", error: error.message });
  }
};

// Get all appointments (for Admin/Receptionist)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "userId name email")
      .populate("doctorId", "userId specialization rating")
      .sort({ createdAt: -1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
  }
};

// Get doctor’s appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;
    console.log("Fetching appointments for doctorId:", doctorId);
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "userId name email")
      .sort({ scheduled_date: 1 });
    console.log("Fetched appointments:", appointments);
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctor appointments",
      error: error.message,
    });
  }
};

// Get patient’s appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.patientId;
    console.log("Fetching appointments for patientId:", patientId);
    const appointments = await Appointment.find({ patientId })
      .populate({
        path: "doctorId",
        select: "userId specialization rating",
        populate: {
          path: "userId",
          model: "User",
          select: "name email profile phone",
        },
      })
      .sort({ scheduled_date: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching patient appointments",
      error: error.message,
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status;
    await appointment.save();

    res
      .status(200)
      .json({ message: "Status updated successfully", appointment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};
