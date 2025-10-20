// utils/cloudinaryUpload.js
import { v2 as cloudinary } from "cloudinary";

// 🔧 Configure Cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

// Upload lab report PDF to Cloudinary
export const uploadLabReportToCloudinary = async (fileBuffer, filename) => {
  try {
    // Cloudinary needs a data URI for buffers
    const base64File = `data:application/pdf;base64,${fileBuffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: "labreports",
      public_id: filename.replace(".pdf", ""),
      resource_type: "raw", // Important for non-image files
      type: "upload", // for public access
      format: "pdf",
    });

    // console.log("PDF uploaded to Cloudinary:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    // console.error("Cloudinary Upload Error:", error.message);
    throw new Error("Failed to upload PDF to Cloudinary");
  }
};

// Upload prescription PDF to Cloudinary
export const uploadPrescriptionToCloudinary = async (fileBuffer, filename) => {
  try {
    // Cloudinary needs a data URI for buffers
    const base64File = `data:application/pdf;base64,${fileBuffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: "prescriptions",
      public_id: filename.replace(".pdf", ""),
      resource_type: "raw", // Important for non-image files
      type: "upload", // for public access
      format: "pdf",
    });

    // console.log("PDF uploaded to Cloudinary:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    // console.error("Cloudinary Upload Error:", error.message);
    throw new Error("Failed to upload PDF to Cloudinary");
  }
};
