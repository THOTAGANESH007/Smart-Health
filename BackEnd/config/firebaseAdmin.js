import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Read JSON file manually
const serviceAccountPath = path.resolve(
  "./config/firebaseServiceAccountKey.json"
);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
