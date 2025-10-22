// src/components/AdminNotificationSender.jsx
import { useState } from "react";
import axios from "axios";

function AdminNotificationSender() {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      await axios.post(
        "http://localhost:7777/api/notifications/send",
        {
          message,
          recipients: "all",
        },
        {
          withCredentials: true, // ✅ send cookies automatically
        }
      );
      alert("✅ Notification sent!");
      setMessage(""); // optional: clear textarea
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("❌ Failed to send notification");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>📤 Send Notification</h3>
      <textarea
        rows="3"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message..."
      />
      <br />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default AdminNotificationSender;
