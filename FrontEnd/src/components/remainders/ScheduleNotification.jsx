import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Clock,
  Bell,
  Users,
  MessageSquare,
  Calendar,
  Send,
  Loader,
  CheckCircle2,
  User,
  Mail,
} from "lucide-react";

const ScheduleNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/patients/getAllUsers`
      );
      setPatients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredPatients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredPatients.map((p) => p._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
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

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/schedule`,
        payload
      );
      
      toast.success("Notification scheduled successfully!");

      setTitle("");
      setMessage("");
      setScheduledTime("");
      setSelectedRecipients([]);
      setSendToAll(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule notification");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const name = p.name?.toLowerCase() || "";
    const email = p.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full">
       
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6">
            <div className="flex items-center gap-3 text-white">
              <Bell size={24} />
              <h2 className="text-xl font-semibold"> Create Medicine Remainders</h2>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter notification title"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter your notification message"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {message.length} characters
              </div>
            </div>

            {/* Scheduled Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Schedule Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="datetime-local"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={getMinDateTime()}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Select the date and time when the notification should be sent
              </p>
            </div>

            {/* Send to All Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={() => {
                    setSendToAll(!sendToAll);
                    setSelectedRecipients([]);
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Users className="text-blue-600" size={20} />
                  <span className="font-semibold text-blue-800">
                    Send to All Users
                  </span>
                </div>
              </label>
              <p className="text-sm text-blue-600 mt-2 ml-8">
                When enabled, notification will be sent to all registered users
              </p>
            </div>

            {/* Recipients Selection */}
            {!sendToAll && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Users size={20} className="text-blue-500" />
                      Select Recipients
                    </h3>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedRecipients.length === filteredPatients.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  {/* Search Bar */}
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="mt-2 text-sm text-gray-600">
                    {selectedRecipients.length} of {filteredPatients.length} selected
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin text-blue-500" size={32} />
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto text-gray-300 mb-2" size={48} />
                      <p className="text-gray-500">
                        {searchQuery ? "No users found" : "No patients available"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredPatients.map((patient) => (
                        <label
                          key={patient._id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedRecipients.includes(patient._id)
                              ? "bg-blue-50 border-blue-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(patient._id)}
                            onChange={() => handleSelectRecipient(patient._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400 flex-shrink-0" />
                              <p className="font-medium text-gray-800 truncate">
                                {patient.name || "Unnamed User"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail size={14} className="text-gray-400 flex-shrink-0" />
                              <p className="text-sm text-gray-500 truncate">
                                {patient.email || "No email"}
                              </p>
                            </div>
                          </div>
                          {selectedRecipients.includes(patient._id) && (
                            <CheckCircle2 className="text-blue-600 flex-shrink-0" size={20} />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Schedule Notification
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setMessage("");
                  setScheduledTime("");
                  setSelectedRecipients([]);
                  setSendToAll(true);
                }}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

       
      </div>
    </div>
  );
};

export default ScheduleNotification;