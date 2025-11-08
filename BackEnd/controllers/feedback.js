import Doctor from "../models/Doctor.js";
import FeedBack from "../models/FeedBack.js";

/**
 * @desc Add feedback for a doctor's appointment
 */
export const addFeedback = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const { doctorId, appointmentId } = req.params;
    const patientId = req.user.patientId;
    //console.log(doctorId,appointmentId,rating)
    // Ensure the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if feedback already exists for this appointment
    const existingFeedback = await FeedBack.findOne({
      patientId,
      doctorId,
      appointmentId,
    });

    if (existingFeedback) {
      return res
        .status(400)
        .json({ message: "Feedback for this appointment already submitted" });
    }

    // Create new feedback
    const feedback = await FeedBack.create({
      patientId,
      doctorId,
      appointmentId,
      rating,
      comments,
    });

    // Update doctor's overall rating
    doctor.totalRating += rating;
    doctor.feedbackCount += 1;
    doctor.rating =
      doctor.feedbackCount > 0 ? doctor.totalRating / doctor.feedbackCount : 0;
    await doctor.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
      averageRating: doctor.rating.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding feedback",
      error: err.message,
    });
  }
};

/**
 * @desc Get all feedbacks for a doctor
 */
export const getDoctorFeedback = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const feedbacks = await FeedBack.find({ doctorId })
      .select("rating comments sentiment patientId appointmentId createdAt")
      .populate("patientId", "userId name")
      .populate("appointmentId", "scheduled_date status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      doctorId,
      doctorName: doctor.name,
      averageRating: doctor.rating.toFixed(2),
      feedbackCount: doctor.feedbackCount,
      feedbacks,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching doctor feedback",
      error: err.message,
    });
  }
};

/**
 * @desc Get all feedbacks submitted by the logged-in patient
 */
export const getPatientFeedback = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const feedbacks = await FeedBack.find({ patientId })
      .select("rating comments doctorId appointmentId")
      .populate({
        path: "doctorId",
        select: "specialization rating userId",
        populate: {
          path: "userId",
          select: "name profile email",
        },
      })
      .populate("appointmentId", "scheduled_date status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      feedbackCount: feedbacks.length,
      feedbacks,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching patient feedback",
      error: err.message,
    });
  }
};
