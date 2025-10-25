import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:7777/api/schedule/all");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await axios.delete(`http://localhost:7777/api/schedule/${id}`);
      toast.success("Deleted successfully!");
      fetchNotifications();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Scheduled Notifications
      </h2>
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">No scheduled notifications.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className="py-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{notif.title}</p>
                <p className="text-gray-600">{notif.message}</p>
                <p className="text-sm text-gray-500">
                  {format(
                    new Date(notif.scheduledTime),
                    "dd MMM yyyy, hh:mm a"
                  )}
                </p>
                <p
                  className={`text-sm ${
                    notif.isSent ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {notif.isSent ? "Sent" : "Pending"}
                </p>
              </div>
              {!notif.isSent && (
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(notif._id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;
