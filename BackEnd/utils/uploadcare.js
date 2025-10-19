import FormData from "form-data";
import fetch from "node-fetch";

const UPLOADCARE_PUBLIC_KEY = process.env.UPLOADCARE_PUBLIC_KEY;

export const uploadFile = async (fileBuffer, filename) => {
  const formData = new FormData();
  formData.append("UPLOADCARE_STORE", "1");
  formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
  formData.append("file", fileBuffer, {
    filename: filename,
    contentType: "application/pdf",
  });

  const response = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.file) throw new Error("Upload failed: no file returned");

  return `https://ucarecdn.com/${data.file}/`;
};
