import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ScheduleNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [patients, setPatients] = useState([]);

  // Fetch patients list
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(
          "http://localhost:7777/api/patients/getAllUsers"
        );
        setPatients(res.data || []);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        toast.error("Failed to load patients");
      }
    };
    fetchPatients();
  }, []);

  const handleSelectRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert local time to UTC
      const localTime = new Date(scheduledTime);
      const utcTime = new Date(
        localTime.getTime() - localTime.getTimezoneOffset() * 60000
      );

      const payload = {
        title,
        message,
        scheduledTime: utcTime,
        sendToAll,
        recipients: sendToAll ? [] : selectedRecipients,
      };

      await axios.post("http://localhost:7777/api/schedule", payload);
      toast.success("Notification scheduled!");

      setTitle("");
      setMessage("");
      setScheduledTime("");
      setSelectedRecipients([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule notification");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Schedule Notification
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Message"
          className="w-full border p-2 rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <input
          type="datetime-local"
          className="w-full border p-2 rounded-md"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          required
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sendToAll}
            onChange={() => setSendToAll(!sendToAll)}
          />
          <label>Send to All Users</label>
        </div>

        {!sendToAll && (
          <div className="border rounded-md p-3 max-h-56 overflow-y-auto">
            <p className="font-medium mb-2">Select Recipients:</p>
            {patients.length === 0 ? (
              <p className="text-gray-500 text-sm">No patients found.</p>
            ) : (
              patients.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between border-b py-1"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(p._id)}
                      onChange={() => handleSelectRecipient(p._id)}
                    />
                    <span>
                      {p.name || "Unnamed"} ({p.email || "no email"})
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Schedule
        </button>
      </form>
    </div>
  );
};

export default ScheduleNotification;
