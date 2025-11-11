import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Bell, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/schedule/all`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/schedule/${id}`
      );
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
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Scheduled Notifications
      </h2>
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-10 rounded-xl shadow-md">
          <Bell className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <p>No scheduled notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => {
            const utcTime = new Date(
              new Date(notif.scheduledTime).getTime() - 5.5 * 60 * 60 * 1000
            );

            // Display either "ALL" or recipient names
            const recipientDisplay = notif.sendToAll
              ? "ALL"
              : notif.recipients
                  ?.map((r) => r?.user?.name)
                  .filter(Boolean)
                  .join(", ") || "No recipients";

            return (
              <div
                key={notif._id}
                className="bg-white p-5 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg flex items-center justify-between"
              >
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {notif.isSent ? (
                      <CheckCircle2 className="text-green-500 h-6 w-6" />
                    ) : (
                      <AlertCircle className="text-yellow-500 h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      {recipientDisplay}
                    </p>
                    <p className="font-semibold text-lg text-gray-800">
                      {notif.title}
                    </p>
                    <p className="text-gray-600">{notif.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {/* {format(displayDate, "dd MMM yyyy, hh:mm a")} */}
                      {utcTime.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      notif.isSent
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {notif.isSent ? "Sent" : "Pending"}
                  </span>
                  {!notif.isSent && (
                    <button
                      className="ml-4 text-gray-500 hover:text-red-600 transition-colors duration-300"
                      onClick={() => handleDelete(notif._id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
