import { useEffect } from "react";
import { requestForToken } from "./firebase";
import axios from "axios";

function NotificationManager() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await requestForToken();
        if (token) {
          console.log("✅ Got FCM token:", token);
          // Send token to backend to store
          await axios.post(
            "http://localhost:7777/api/auth/save-fcm-token",
            {
              fcmToken: token,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      } catch (err) {
        console.error("Error setting up notifications:", err);
      }
    };

    setupNotifications();
  }, []);

  return null; // No UI needed here
}

export default NotificationManager;
