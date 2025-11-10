import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, MessageCircle, User, Star, X, Loader } from "lucide-react";

const GetPatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    doctorId: null,
    appointmentId: null,
    doctorName: "",
  });
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Fetch patient's appointments
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

  // Open feedback modal
  const openFeedbackModal = (appointment) => {
    const doctor = appointment.doctorId;
    setFeedbackModal({
      isOpen: true,
      doctorId: doctor._id,
      appointmentId: appointment._id,
      doctorName: doctor?.userId?.name || "Doctor",
    });
    setFeedbackData({ rating: 0, comment: "" });
    setHoverRating(0);
  };

  // Close feedback modal
  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      doctorId: null,
      appointmentId: null,
      doctorName: "",
    });
    setFeedbackData({ rating: 0, comment: "" });
    setHoverRating(0);
  };

  // Submit feedback
  const submitFeedback = async () => {
    if (feedbackData.rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setSubmittingFeedback(true);
     // console.log(feedbackModal.doctorId,feedbackModal.appointmentId,feedbackData.comment)
      const response = await axios.post(
        `${baseUrl}/api/feedback/${feedbackModal.doctorId}/${feedbackModal.appointmentId}`,
        {
          rating: feedbackData.rating,
          comments: feedbackData.comment,
        },
        axiosConfig
      );

      if (response.status === 200 || response.status === 201) {
        alert("Feedback submitted successfully!");
        closeFeedbackModal();
        
        // Optionally refresh appointments to update feedback status
        const res = await axios.get(
          `${baseUrl}/api/appointments/getPatientAppointments`,
          axiosConfig
        );
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
              <div className="text-center">
                <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                <p className="text-gray-600 text-lg">Loading appointments...</p>
              </div>
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
  const statusSteps = ["PENDING", "CONFIRMED", "COMPLETED"];

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
          const isCompleted = appointment.status === "COMPLETED";

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

                {/* Status Tracker */}
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

                  {/* Feedback Button for Completed Appointments */}
                  {isCompleted && (
                    <div className="mt-4">
                      <button
                        onClick={() => openFeedbackModal(appointment)}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Star size={18} />
                        Give Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={closeFeedbackModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Rate Your Experience
              </h3>
              <p className="text-gray-600">
                How was your appointment with{" "}
                <span className="font-semibold text-indigo-600">
                  {feedbackModal.doctorName}
                </span>
                ?
              </p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFeedbackData({ ...feedbackData, rating: star })
                    }
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={`${
                        star <= (hoverRating || feedbackData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {feedbackData.rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {feedbackData.rating === 5 && "Excellent!"}
                  {feedbackData.rating === 4 && "Great!"}
                  {feedbackData.rating === 3 && "Good"}
                  {feedbackData.rating === 2 && "Fair"}
                  {feedbackData.rating === 1 && "Poor"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, comment: e.target.value })
                }
                placeholder="Share your experience..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={submitFeedback}
              disabled={submittingFeedback || feedbackData.rating === 0}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submittingFeedback ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetPatientAppointments;