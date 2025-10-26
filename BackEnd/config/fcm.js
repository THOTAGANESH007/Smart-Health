import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Function to get Firebase credentials from env or file
function getServiceAccount() {
  try {
    // 1️⃣ On Render (production): use FIREBASE_SERVICE_ACCOUNT env variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log("✅ Using FIREBASE_SERVICE_ACCOUNT from environment");
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    // 2️⃣ On localhost: use JSON file from config/
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.resolve("config/firebaseServiceAccountKey.json");

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        `Service account file not found at: ${serviceAccountPath}`
      );
    }

    console.log(
      `✅ Using local Firebase service account from: ${serviceAccountPath}`
    );
    return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  } catch (error) {
    console.error("❌ Failed to load Firebase service account:", error.message);
    throw error;
  }
}

// 🔹 Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
  const serviceAccount = getServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("🔥 Firebase Admin initialized successfully");
} else {
  console.log("♻️ Reusing existing Firebase Admin instance");
}

// 🔹 Function to send notifications
export const sendNotification = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) {
    console.warn("⚠️ No tokens provided for FCM message");
    return;
  }

  const message = {
    notification: { title, body },
    tokens, // Multicast
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notifications sent: ${response.successCount} success`);
  } catch (error) {
    console.error("❌ Error sending notifications:", error);
  }
};

export default admin;
