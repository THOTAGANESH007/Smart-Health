import React, { useState } from "react";
import axios from "axios";
import {
  Send,
  Bell,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
  Loader,
} from "lucide-react";

const AdminNotificationSender = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      setSending(true);
      setShowError(false);

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/send`,
        {
          message,
          recipients: "all",
        },
        {
          withCredentials: true,
        }
      );

      setShowSuccess(true);
      setMessage("");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error sending notification:", err);
      setShowError(true);

      // Hide error message after 3 seconds
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50  flex items-center justify-center">
      <div className="max-w-3xl w-full">

        {/* Success Alert */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-2 rounded-lg shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-green-800">
                  Notification Sent Successfully!
                </p>
                <p className="text-sm text-green-700">
                  Your message has been delivered to all users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {showError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-red-800">
                  Failed to Send Notification
                </p>
                <p className="text-sm text-red-700">
                  Please try again or contact support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6">
            <div className="flex items-center gap-2 text-white">
              <MessageSquare size={24} />
              <h2 className="text-xl font-semibold">Compose Message</h2>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            {/* Recipients Info */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Users className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Recipients
                </p>
                <p className="text-sm text-blue-600">
                  This notification will be sent to all users
                </p>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your notification message here..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
                  disabled={sending}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {message.length} characters
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Write a clear and concise message for your notification.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Notification
                  </>
                )}
              </button>
              <button
                onClick={() => setMessage("")}
                disabled={sending}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default AdminNotificationSender;