import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, MessageCircle, User } from "lucide-react";

const GetPatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Fetch patient’s appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/appointments/getPatientAppointments`,
          axiosConfig
        );
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Loading appointments...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        No appointments found.
      </div>
    );
  }

  // Helper: define the order of statuses
  const statusSteps = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];

  // Helper to get the current step index
  const getCurrentStepIndex = (status) => statusSteps.indexOf(status);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        My Appointments
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => {
          const doctor = appointment.doctorId;
          const doctorName = doctor?.userId?.name;
          const specialization = doctor?.specialization || "General";
          const profile = doctor?.userId?.profile || "/default-doctor.png";

          const date = new Date(appointment.scheduled_date);
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const currentStep = getCurrentStepIndex(appointment.status);

          return (
            <div
              key={appointment._id}
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden border border-gray-100"
            >
              {/* Doctor info */}
              <div className="flex items-center gap-4 p-4 border-b">
                <img
                  src={profile}
                  alt={doctorName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User size={18} className="text-indigo-500" />
                    {doctorName}
                  </h3>
                  <p className="text-sm text-gray-500">{specialization}</p>
                </div>
              </div>

              {/* Appointment info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MessageCircle className="text-indigo-500 w-5 h-5 mt-1" />
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {appointment.message}
                  </p>
                </div>

                {/* Date and Time */}
                <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{formattedTime}</span>
                  </div>
                </div>

                {/* Flipkart-style Status Tracker */}
                <div className="mt-4">
                  <div className="flex items-center justify-between relative">
                    {statusSteps.map((step, index) => (
                      <div
                        key={step}
                        className="flex flex-col items-center w-full"
                      >
                        {/* Step circle */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center
                            ${
                              index <= currentStep
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200 text-gray-400"
                            }
                            transition-all duration-300 relative
                          `}
                        >
                          <div className="absolute w-full h-[2px] bg-gray-200 -z-10 left-1/2 top-1/2 transform -translate-y-1/2">
                            {index > 0 && (
                              <div
                                className={`absolute left-0 top-0 h-[2px] transition-all duration-300 ${
                                  index <= currentStep
                                    ? "bg-indigo-600 w-full"
                                    : "bg-gray-200 w-0"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                        {/* Step label */}
                        <span
                          className={`text-xs mt-2 ${
                            index <= currentStep
                              ? "text-indigo-700 font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          {step.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* If cancelled */}
                  {appointment.status === "CANCELLED" && (
                    <div className="text-center mt-3 text-sm font-medium text-red-600">
                      ❌ Appointment Cancelled
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GetPatientAppointments;
