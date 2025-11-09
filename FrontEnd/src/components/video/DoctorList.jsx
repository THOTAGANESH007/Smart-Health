import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { User, BriefcaseMedical, Clock, Phone } from "lucide-react";

const socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [callingDoctor, setCallingDoctor] = useState(null);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.patientId) {
      socket.emit("register-user", user.patientId);
    }
    fetchDoctors();
  }, [user?.patientId]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/admin/getAllDoctors`,
        axiosConfig
      );
      setDoctors(res.data.doctors || []);
    } catch {
      setError("Error fetching doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleCallDoctor = async (doctor) => {
    if (!user?.patientId) return alert("You must be logged in as a patient!");
    if (callingDoctor) return;

    setCallingDoctor(doctor._id);

    try {
      const res = await axios.post(
        `${baseUrl}/api/calls/create`,
        { doctorId: doctor._id, patientId: user.patientId },
        axiosConfig
      );

      const { roomId, _id: callId } = res.data.call;

      socket.emit("initiate-call", {
        doctorId: doctor._id,
        patientId: user.patientId,
        roomId,
        callId,
      });
     
      navigate(`/patient/call/${roomId}`);
    } catch (err) {
      console.error(err);
      setCallingDoctor(null);
      alert("Failed to start call.");
    }
  };

  if (loading) return <p className="text-center">Loading doctors...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            className="border rounded-lg p-4 shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <User className="w-6 h-6" />
              <h3 className="text-lg font-bold">{doc.userId?.name}</h3>
            </div>
            <p className="text-gray-700 flex items-center gap-2 mb-1">
              <BriefcaseMedical className="w-4 h-4" />{" "}
              {doc.specialization || "General"}
            </p>
            <p className="text-gray-700 flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" /> {doc.experience_years || 0} years
            </p>
            <p className="text-gray-700 flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4" /> {doc.userId?.phone || "N/A"}
            </p>
            <button
              onClick={() => handleCallDoctor(doc)}
              disabled={!!callingDoctor}
              className={`mt-3 w-full py-2 rounded-md text-white transition ${
                callingDoctor === doc._id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {callingDoctor === doc._id ? "Connecting..." : "Call Doctor"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
