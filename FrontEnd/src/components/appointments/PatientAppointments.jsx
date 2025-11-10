import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Star,
  User,
  BriefcaseMedical,
  Video,
  MapPin,
  MessageSquare,
  Save,
  Loader,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";

const PatientAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/admin/getAllDoctors`,
        axiosConfig
      );
      setDoctors(res.data.doctors || []);
    } catch {
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!scheduledDate || !message) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setCreating(true);
      const res = await axios.post(
        `${baseUrl}/api/appointments/${selectedDoctor._id}`,
        { scheduled_date: scheduledDate, message },
        axiosConfig
      );
      setSuccess(res.data.message);
      setMessage("");
      setScheduledDate("");
      setSelectedDoctor(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error booking appointment");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-black">Book an Appointment</h2>
          <p className="text-gray-600 mt-1">
            Choose your doctor, set the date, and describe your concern.
          </p>
        </div>

        {/* Success/Error */}
        {success && (
          <div className="bg-green-50 text-green-800 border-2 border-green-800 p-3 rounded-lg flex items-center mb-4">
            <CheckCircle className="w-5 h-5 mr-2" />
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-800 border-2 border-red-800 p-3 rounded-lg flex items-center mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        {/* Show doctor list or appointment form */}
        {!selectedDoctor ? (
          <>
            {loading ? (
              <div className="flex justify-center py-6 text-gray-600">
                <Loader className="animate-spin w-6 h-6 mr-2" /> Loading
                doctors...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc)}
                    className="cursor-pointer border-2 border-gray-300 hover:border-black rounded-lg p-5 transition shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* <div className="bg-black text-white p-3 rounded-full"> */}
                        {doc.userId.profile ?(<img
                                            src={doc.userId.profile || '/default-profile.png'}
                                            alt="User"
                                            className="object-cover w-13 h-13 rounded-full"
                                          />):(<div className="bg-black text-white p-2 rounded-full">
                                          <User className="w-7 h-7" />
                                        </div>)}
                        {/* <image src={doc.userId?.profile?doc.userId?.profile:<User className="w-5 h-5"} /> */}
                      {/* </div> */}
                      <h3 className="text-lg font-bold text-black">
                        {doc.userId?.name || "Dr. Unknown"}
                      </h3>
                    </div>
                    <p className="text-gray-700 flex items-center gap-2 mb-1">
                      <BriefcaseMedical className="w-4 h-4" />{" "}
                      {doc.specialization || "General Practitioner"}
                    </p>
                    <p className="text-gray-700 flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" /> {doc.experience_years || 0}{" "}
                      years experience
                    </p>

                    <p className="text-gray-700 flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4" />{" "}
                      {doc.userId?.phone || 9876589765}
                    </p>
                    <p className="text-gray-700 flex items-center gap-2 mb-1">
                      {doc.consultation_type === "ONLINE" ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}{" "}
                      {doc.consultation_type}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(doc.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill={
                            i < Math.round(doc.rating) ? "currentColor" : "none"
                          }
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">
                        ({doc.rating?.toFixed(1) || 0})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="border-2 border-black rounded-lg p-6 bg-white shadow-md max-w-lg mx-auto">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="flex items-center text-sm mb-4 text-gray-600 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to doctor list
            </button>

            <h3 className="text-2xl font-bold text-black mb-2">
              Dr. {selectedDoctor.userId?.name}
            </h3>
            <p className="text-gray-700 mb-4">
              <strong>Specialization:</strong> {selectedDoctor.specialization}
            </p>

            <label className="block text-sm font-medium text-black mb-2">
              Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 focus:border-black outline-none"
            />

            <label className="block text-sm font-medium text-black mb-2">
              Message / Reason for Visit
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Describe your concern..."
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 focus:border-black outline-none"
            ></textarea>

            <button
              onClick={handleBookAppointment}
              disabled={creating}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader className="animate-spin w-5 h-5 mr-2" /> Booking...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Confirm Appointment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
