import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve("config/firebaseServiceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Service account file not found at: ${serviceAccountPath}`);
}

// console.log(`Using Firebase service account from: ${serviceAccountPath}`);

let app;
if (admin.apps.length === 0) {
  // Initialize only once
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
  // console.log("Firebase Admin initialized successfully");
} else {
  // Reuse the existing instance
  app = admin.app();
  // console.log("♻️ Reusing existing Firebase app instance");
}

export const sendNotification = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) {
    // console.log("No tokens provided for FCM message");
    return;
  }

  const message = {
    notification: { title, body },
    tokens, // Multicast
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    // console.log(`Notifications sent: ${response.successCount} success`);
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};
