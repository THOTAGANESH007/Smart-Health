import PDFDocument from "pdfkit";

export const generatePrescriptionPDF = (prescription, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).text("Prescription", { align: "center" });
      doc.moveDown();

      // Patient details
      doc.fontSize(12).text(`Patient: ${patient.name}`);
      doc.text(`Age: ${patient.age}  Gender: ${patient.gender}`);
      doc.text(`Blood Group: ${patient.blood_group}`);
      doc.moveDown();

      // Diagnosis
      if (prescription.diagnosis) {
        doc.fontSize(14).text("Diagnosis:", { underline: true });
        doc.fontSize(12).text(prescription.diagnosis);
        doc.moveDown();
      }

      // Medications
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

      // Precautions
      if (prescription.precautions.length > 0) {
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
      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text("Lab Test Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Patient: ${labTest.patientId.userId.name}`);
      doc.text(`Test Date: ${new Date(labTest.test_date).toLocaleString()}`);
      doc.text(`Status: ${labTest.status}`);
      doc.moveDown();

      if (labTest.diagnosis) doc.text(`Diagnosis: ${labTest.diagnosis}`);
      doc.moveDown();

      doc.text("Test Results:");
      doc.moveDown();
      labTest.test_results.forEach((test, i) => {
        doc.text(
          `${i + 1}. ${test.test_name} - ${test.result || "N/A"} ${
            test.units || ""
          } (Normal Range: ${test.normal_range || "N/A"})`
        );
        if (test.remarks) doc.text(`   Remarks: ${test.remarks}`);
      });

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
