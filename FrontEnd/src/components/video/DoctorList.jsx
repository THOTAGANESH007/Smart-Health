import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { User, BriefcaseMedical, Clock, Phone, History, X } from "lucide-react";

const socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [callingDoctor, setCallingDoctor] = useState(null);
  const [previousCalls, setPreviousCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [showCallHistory, setShowCallHistory] = useState(false);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.patientId) {
      socket.emit("register-user", user.patientId);
      console.log("Patient registered:", user.patientId);
      fetchPreviousCalls();
    }

    fetchDoctors();

    // Listen for call acceptance
    socket.on("call-accepted", ({ roomId }) => {
      console.log("Call accepted, joining room:", roomId);
      navigate(`/patient/call/${roomId}`);
      setCallingDoctor(null);
    });

    // Listen for call rejection
    socket.on("call-rejected", () => {
      alert("The doctor is unavailable at the moment.");
      setCallingDoctor(null);
      fetchPreviousCalls(); // Refresh call history
    });

    // Listen for doctor offline
    socket.on("doctor-offline", () => {
      alert("The doctor is currently offline.");
      setCallingDoctor(null);
    });

    return () => {
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("doctor-offline");
    };
  }, [user?.patientId, navigate]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${baseUrl}/api/admin/getAllDoctors`,
        axiosConfig
      );
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Error fetching doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousCalls = async () => {
    try {
      setLoadingCalls(true);
      const response = await axios.get(
        `${baseUrl}/api/calls/patient/${user.patientId}`,
        { withCredentials: true }
      );

      const sortedCalls = (response.data.calls || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPreviousCalls(sortedCalls);
    } catch (error) {
      console.error("Error fetching previous calls:", error);
    } finally {
      setLoadingCalls(false);
    }
  };

  const handleCallDoctor = async (doctor) => {
    if (!user?.patientId) {
      alert("You must be logged in as a patient!");
      return;
    }

    if (callingDoctor) {
      return;
    }

    setCallingDoctor(doctor._id);

    try {
      const res = await axios.post(
        `${baseUrl}/api/calls/create`,
        { doctorId: doctor._id, patientId: user.patientId },
        axiosConfig
      );

      const { roomId, _id: callId } = res.data.call;

      console.log("Call created, initiating:", {
        doctorId: doctor._id,
        roomId,
        callId,
      });

      socket.emit("initiate-call", {
        doctorId: doctor._id,
        patientId: user.patientId,
        roomId,
        callId,
      });

      // Set a timeout in case doctor doesn't respond
      setTimeout(() => {
        if (callingDoctor === doctor._id) {
          setCallingDoctor(null);
          alert("Call timeout. The doctor may be unavailable.");
          fetchPreviousCalls(); // Refresh call history
        }
      }, 30000); // 30 seconds timeout
    } catch (err) {
      console.error("Error starting call:", err);
      setCallingDoctor(null);
      alert("Failed to start call. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      accepted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      ended: "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };

    const icons = {
      accepted: "✓",
      rejected: "✗",
      ended: "○",
      pending: "⏳",
    };

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium border ${
          styles[status] || styles.pending
        }`}
      >
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCallDuration = (call) => {
    if (!call.callEndedAt || !call.callStartedAt) return null;

    const start = new Date(call.callStartedAt);
    const end = new Date(call.callEndedAt);
    const duration = Math.floor((end - start) / 1000);

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-center mb-4">{error}</p>
        <button
          onClick={fetchDoctors}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Available Doctors
        </h1>

        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No doctors available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white border rounded-lg p-6 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {doc.userId?.name || "Unknown"}
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-700 flex items-center gap-2">
                    <BriefcaseMedical className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {doc.specialization || "General Physician"}
                    </span>
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{doc.experience_years || 0} years experience</span>
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{doc.userId?.phone || "N/A"}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleCallDoctor(doc)}
                  disabled={!!callingDoctor}
                  className={`w-full py-3 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 ${
                    callingDoctor === doc._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {callingDoctor === doc._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      Call Doctor
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating History Button */}
      <button
        onClick={() => setShowCallHistory(!showCallHistory)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-110 z-40 group"
        title="View Call History"
      >
        <History className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {previousCalls.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {previousCalls.length > 9 ? "9+" : previousCalls.length}
          </span>
        )}
      </button>

      {/* Call History Sidebar */}
      {showCallHistory && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setShowCallHistory(false)}
          />

          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-2xl font-bold">Call History</h3>
                <p className="text-purple-100 text-sm mt-1">
                  Your consultations
                </p>
              </div>
              <button
                onClick={() => setShowCallHistory(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loadingCalls ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-500">Loading calls...</p>
                </div>
              ) : previousCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Phone className="w-20 h-20 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No previous calls</p>
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    Your call history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {previousCalls.map((call) => (
                    <div
                      key={call._id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      {/* Doctor Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <BriefcaseMedical className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {call.doctorId?.userId?.name || "Unknown Doctor"}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {call.doctorId?.specialization ||
                                "General Physician"}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(call.status)}
                      </div>

                      {/* Call Details */}
                      <div className="space-y-2 ml-13">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(call.createdAt)}</span>
                          <span className="text-gray-400">•</span>
                          <span>{formatTime(call.createdAt)}</span>
                        </div>

                        {call.status === "ended" && getCallDuration(call) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>Duration: {getCallDuration(call)}</span>
                          </div>
                        )}

                        {call.doctorId?.userId?.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>📱</span>
                            <span>{call.doctorId.userId.phone}</span>
                          </div>
                        )}

                        {call.doctorId?.experience_years && (
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>👨‍⚕️</span>
                            <span>
                              {call.doctorId.experience_years} years experience
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
              <button
                onClick={fetchPreviousCalls}
                disabled={loadingCalls}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCalls ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorList;
