import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import { generatePrescriptionPDF } from "../utils/pdfGenerator.js";
import { uploadPrescriptionToCloudinary } from "../utils/cloudinaryUpload.js";
import axios from "axios";

// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { diagnosis, medications, precautions } = req.body;
    const doctorId = req.user._id; // logged-in doctor

    const patient = await Patient.findById(patientId).populate(
      "userId",
      "name"
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    // Create prescription object
    const prescriptionData = {
      patientId,
      doctorId,
      medications,
      precautions,
      diagnosis,
      signed: true,
    };

    // Generate PDF
    const pdfBuffer = await generatePrescriptionPDF(prescriptionData, patient);
    const patientName = patient.userId?.name || "patient";
    // Upload PDF to Cloudinary
    const fileUrl = await uploadPrescriptionToCloudinary(
      pdfBuffer,
      `prescription_${patientName}`
    );
    prescriptionData.file_url = fileUrl;

    // Save prescription
    const prescription = await Prescription.create(prescriptionData);

    res.status(201).json({
      message: "Prescription created successfully",
      prescription,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating prescription", error: err.message });
  }
};

// Get all prescriptions of a patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .populate("doctorId", "userId specialization name")
      .select("prescription_date file_url medications")
      .sort({ prescription_date: -1 });

    res.status(200).json({ prescriptions });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching prescriptions", error: err.message });
  }
};

// Get a single prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId)
      .populate("doctorId", "userId specialization name")
      .populate("patientId", "userId name age gender blood_group")
      .select("prescription_date file_url medications");

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    res.status(200).json({ prescription });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching prescription", error: err.message });
  }
};

// Download prescription PDF
// export const downloadPrescription = async (req, res) => {
//   try {
//     const { prescriptionId } = req.params;

//     const prescription = await Prescription.findById(prescriptionId);
//     if (!prescription)
//       return res.status(404).json({ message: "Prescription not found" });

//     if (!prescription.file_url)
//       return res.status(404).json({ message: "PDF not available" });

//     // Fetch the PDF from Cloudinary
//     const response = await axios.get(prescription.file_url, {
//       responseType: "stream",
//     });

//     // Set headers for download
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=prescription_${prescriptionId}.pdf`
//     );
//     res.setHeader("Content-Type", "application/pdf");

//     // Stream the PDF to client
//     response.data.pipe(res);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error downloading prescription", error: err.message });
//   }
// };
