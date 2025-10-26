import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Function to load Firebase service account dynamically
function getServiceAccount() {
  try {
    // 🔹 1️⃣ If environment variable exists (Render / production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    // 🔹 2️⃣ Else, try local JSON file (localhost / dev)
    // const serviceAccountPath = path.resolve(
    //   "./config/firebaseServiceAccountKey.json"
    // );

    // if (fs.existsSync(serviceAccountPath)) {
    //   const data = fs.readFileSync(serviceAccountPath, "utf8");
    //   return JSON.parse(data);
    // }

    // 🔹 3️⃣ If neither found
    throw new Error("Firebase service account not found in env or file!");
  } catch (err) {
    // console.error("❌ Error loading Firebase service account:", err.message);
    throw err;
  }
}

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  const serviceAccount = getServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  // console.log("✅ Firebase Admin initialized");
}

export default admin;
