// src/components/NotificationHandler.js
import { useEffect } from "react";
import { onMessageListener } from "./firebase";
const NotificationHandler = () => {
  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload) => {
        const { title, body } = payload.notification;
        new Notification(title, { body });
      })
      .catch((err) => console.error("Error in message listener:", err));

    return () => unsubscribe;
  }, []);

  return null;
};

export default NotificationHandler;
