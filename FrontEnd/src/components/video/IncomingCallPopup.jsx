import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Phone, PhoneOff, Clock, User, X, History } from "lucide-react";

const socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

const IncomingCallPopup = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [previousCalls, setPreviousCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [showCallHistory, setShowCallHistory] = useState(false);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.doctorId) {
      socket.emit("register-user", user.doctorId);
      fetchPreviousCalls();
    }

    socket.on("incoming-call", ({ from, roomId, callId }) => {
      setIncomingCall({ from, roomId, callId });
    });

    socket.on("call-canceled", () => {
      setIncomingCall(null);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-canceled");
    };
  }, [user?.doctorId]);

  const fetchPreviousCalls = async () => {
    try {
      setLoadingCalls(true);
      const response = await axios.get(
        `${baseUrl}/api/calls/doctor/${user.doctorId}`,
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

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      await axios.put(
        `${baseUrl}/api/calls/${incomingCall.callId}/status`,
        { status: "accepted" },
        { withCredentials: true }
      );

      socket.emit("accept-call", {
        patientId: incomingCall.from,
        roomId: incomingCall.roomId,
      });

      navigate(`/doctor/call/${incomingCall.roomId}`);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Failed to accept call. Please try again.");
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;

    try {
      await axios.put(
        `${baseUrl}/api/calls/${incomingCall.callId}/status`,
        { status: "rejected" },
        { withCredentials: true }
      );

      socket.emit("reject-call", { patientId: incomingCall.from });
      setIncomingCall(null);

      fetchPreviousCalls();
    } catch (error) {
      console.error("Error rejecting call:", error);
      alert("Failed to reject call. Please try again.");
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

  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce-in">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-slow">
                <Phone className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Incoming Call
              </h2>
              <p className="text-gray-600 text-lg">
                A patient needs your assistance
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={acceptCall}
                className="flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition transform hover:scale-105 shadow-lg font-semibold"
              >
                <Phone className="w-5 h-5" />
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition transform hover:scale-105 shadow-lg font-semibold"
              >
                <PhoneOff className="w-5 h-5" />
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating History Button */}
      <button
        onClick={() => setShowCallHistory(!showCallHistory)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-110 z-40 group"
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-2xl font-bold">Call History</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Recent consultations
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Loading calls...</p>
                </div>
              ) : previousCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Phone className="w-20 h-20 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No previous calls</p>
                  <p className="text-sm text-gray-400 mt-2">
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
                      {/* Patient Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {call.patientId?.userId?.name ||
                                "Unknown Patient"}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatTime(call.createdAt)}
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
                        </div>

                        {call.status === "ended" && getCallDuration(call) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>Duration: {getCallDuration(call)}</span>
                          </div>
                        )}

                        {call.patientId?.userId?.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>📱</span>
                            <span>{call.patientId.userId.phone}</span>
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCalls ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default IncomingCallPopup;
