// src/components/NotificationPermission.js
import { useEffect } from "react";
import { requestForToken } from "./firebase";

const NotificationPermission = ({ onTokenReceived }) => {
  useEffect(() => {
    const getPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await requestForToken();
          if (token) onTokenReceived(token);
        } else {
          // console.warn("🔕 Notification permission not granted.");
        }
      } catch (err) {
        console.error("Error requesting notification permission:", err);
      }
    };

    getPermission();
  }, [onTokenReceived]);

  return null;
};

export default NotificationPermission;
