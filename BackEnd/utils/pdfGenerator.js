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
