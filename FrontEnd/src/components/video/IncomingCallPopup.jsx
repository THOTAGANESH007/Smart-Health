import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

const IncomingCallPopup = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.doctorId) {
      socket.emit("register-user", user.doctorId);
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
  }, [user?.doctorId, incomingCall]);

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
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white border shadow-lg p-4 rounded-lg z-50 animate-fade-in">
      <p className="font-semibold mb-2 text-gray-800">
        📞 Incoming call from patient
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={acceptCall}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Accept
        </button>
        <button
          onClick={rejectCall}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default IncomingCallPopup;
