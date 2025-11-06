import LabTest from "../models/LabTest.js";
import Patient from "../models/Patient.js";
import { generateLabTestPDF } from "../utils/pdfGenerator.js";
import { uploadLabReportToCloudinary } from "../utils/cloudinaryUpload.js";

// Create a new lab test (by doctor)
export const createLabTest = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { diagnosis, test_results, remarks } = req.body;
    const doctorId = req.user.doctorId; // logged-in doctor

    const patient = await Patient.findById(patientId).populate(
      "userId",
      "name email phone"
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const labTestData = {
      patientId,
      doctorId,
      diagnosis,
      test_results,
      remarks,
    };

    const labTest = await LabTest.create(labTestData);
    res.status(201).json({ message: "Lab test created successfully", labTest });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating lab test", error: err.message });
  }
};

// Update lab test with results & generate PDF
export const completeLabTest = async (req, res) => {
  try {
    const { labTestId } = req.params;
    const { test_results, remarks } = req.body;

    const labTest = await LabTest.findById(labTestId).populate({
      path: "patientId",
      populate: {
        path: "userId",
        select: "name email phone",
      },
    });

    if (!labTest)
      return res.status(404).json({ message: "Lab test not found" });

    labTest.test_results = test_results;
    labTest.remarks = remarks;
    labTest.status = "COMPLETED";

    // Generate and upload PDF
    const pdfBuffer = await generateLabTestPDF(labTest);
    const patientName = labTest.patientId?.userId?.name || "patient";

    const fileUrl = await uploadLabReportToCloudinary(
      pdfBuffer,
      `labtest_${patientName}`
    );

    labTest.file_url = fileUrl;
    await labTest.save();
    res.status(200).json({ message: "Lab test completed", labTest });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating lab test", error: err.message });
  }
};

// Get all lab tests of a patient
export const getPatientLabTests = async (req, res) => {
  try {
    const { patientId } = req.params;
    const tests = await LabTest.find({ patientId })
      .populate("doctorId", "userId specialization")
      .sort({ test_date: -1 });

    res.status(200).json({ tests });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching lab tests", error: err.message });
  }
};

// Get single lab test by ID
export const getLabTestById = async (req, res) => {
  try {
    const { labTestId } = req.params;
    const labTest = await LabTest.findById(labTestId)
      .populate("patientId", "userId name age gender")
      .populate("doctorId", "userId specialization");

    if (!labTest)
      return res.status(404).json({ message: "Lab test not found" });
    res.status(200).json({ labTest });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching lab test", error: err.message });
  }
};

// Download lab test report
export const downloadLabReport = async (req, res) => {
  try {
    const { labTestId } = req.params;
    const labTest = await LabTest.findById(labTestId);
    if (!labTest)
      return res.status(404).json({ message: "Lab test not found" });
    if (!labTest.file_url)
      return res.status(404).json({ message: "Report not generated" });

    res.redirect(labTest.file_url);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error downloading report", error: err.message });
  }
};
