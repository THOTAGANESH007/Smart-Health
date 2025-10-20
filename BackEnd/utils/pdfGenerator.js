import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const generatePrescriptionPDF = (prescription, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Save locally
        const uploadsDir = path.resolve("uploads/prescriptions");
        ensureUploadDir(uploadsDir);
        const filePath = path.join(
          uploadsDir,
          `prescription_${patient.userId?.name}.pdf`
        );
        fs.writeFileSync(filePath, pdfBuffer);
        // console.log(`Prescription PDF saved locally at: ${filePath}`);

        resolve(pdfBuffer);
      });

      doc.fontSize(20).text("Prescription", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Patient: ${patient.userId?.name}`);
      doc.text(`Age: ${patient.age}  Gender: ${patient.gender}`);
      doc.text(`Blood Group: ${patient.blood_group}`);
      doc.moveDown();

      if (prescription.diagnosis) {
        doc.fontSize(14).text("Diagnosis:", { underline: true });
        doc.fontSize(12).text(prescription.diagnosis);
        doc.moveDown();
      }

      if (prescription.medications?.length) {
        doc.fontSize(14).text("Medications:", { underline: true });
        prescription.medications.forEach((med, i) => {
          doc.text(
            `${i + 1}. ${med.medicine_name} - ${med.dosage}, ${
              med.frequency
            }, Duration: ${med.duration}${
              med.instructions ? ` (${med.instructions})` : ""
            }`
          );
        });
      }

      if (prescription.precautions?.length > 0) {
        doc.moveDown();
        doc.fontSize(14).text("Precautions:", { underline: true });
        prescription.precautions.forEach((prec, i) => {
          doc.text(`${i + 1}. ${prec}`);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateLabTestPDF = (labTest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Save locally
        const uploadsDir = path.resolve("uploads/labtests");
        ensureUploadDir(uploadsDir);
        const patientName =
          labTest.patientId?.userId?.name?.replace(/\s+/g, "_") || "Unknown";
        const filePath = path.join(uploadsDir, `labtest_${patientName}.pdf`);
        fs.writeFileSync(filePath, pdfBuffer);
        // console.log(`Lab Test PDF saved locally at: ${filePath}`);

        resolve(pdfBuffer);
      });

      doc.fontSize(20).text("Lab Test Report", { align: "center" });
      doc.moveDown();

      const patientName = labTest.patientId?.userId?.name || "Unknown Patient";
      doc.fontSize(12).text(`Patient: ${patientName}`);
      doc.text(
        `Test Date: ${
          labTest.test_date
            ? new Date(labTest.test_date).toLocaleString()
            : "N/A"
        }`
      );
      doc.text(`Status: ${labTest.status || "N/A"}`);
      doc.moveDown();

      if (labTest.diagnosis)
        doc.fontSize(12).text(`Diagnosis: ${labTest.diagnosis}`);
      doc.moveDown();

      if (labTest.test_results?.length) {
        doc.fontSize(14).text("Test Results:", { underline: true });
        doc.moveDown();
        labTest.test_results.forEach((test, i) => {
          doc.text(
            `${i + 1}. ${test.test_name} - ${test.result || "N/A"} ${
              test.units || ""
            } (Normal Range: ${test.normal_range || "N/A"})`
          );
          if (test.remarks) doc.text(`   Remarks: ${test.remarks}`);
        });
      }

      if (labTest.remarks) {
        doc.moveDown();
        doc.text(`Doctor Remarks: ${labTest.remarks}`);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
