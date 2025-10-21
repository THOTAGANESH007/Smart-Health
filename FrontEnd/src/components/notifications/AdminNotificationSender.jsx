// src/components/AdminNotificationSender.jsx
import { useState } from "react";
import axios from "axios";

function AdminNotificationSender() {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    try {
      await axios.post(
        "http://localhost:7777/api/notifications/send",
        {
          message,
          recipients: "all",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("✅ Notification sent!");
    } catch (err) {
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
