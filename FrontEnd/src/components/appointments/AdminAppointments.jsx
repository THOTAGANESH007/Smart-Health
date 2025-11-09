import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  User,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/appointments/getAllAppointments`,
        axiosConfig
      );
      setAppointments(res.data.appointments || []);
    } catch {
      setError("Failed to load appointments");
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axios.put(
        `${baseUrl}/api/appointments/${id}/status`,
        { status },
        axiosConfig
      );
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      setMessage("Status updated successfully!");
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white border-2 border-black p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
         
          <p className="text-gray-600 mt-1">
            View and update appointment statuses
          </p>
        </div>

        {message && (
          <div className="bg-green-50 text-green-800 p-3 mb-3 rounded-lg border-2 border-green-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <p>{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-800 p-3 mb-3 rounded-lg border-2 border-red-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {appointments.map((a) => (
            <div
              key={a._id}
              className="border-2 border-gray-300 p-4 rounded-lg flex flex-col md:flex-row justify-between"
            >
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient: {a.patientId?.name}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <Stethoscope className="w-4 h-4" /> Doctor:{" "}
                  {a.doctorId?.userId}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />{" "}
                  {new Date(a.scheduled_date).toLocaleString()}
                </p>
              </div>
              <select
                className="border-2 border-gray-300 p-2 rounded-lg mt-2 md:mt-0"
                value={a.status}
                onChange={(e) => updateStatus(a._id, e.target.value)}
                disabled={updating === a._id}
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
