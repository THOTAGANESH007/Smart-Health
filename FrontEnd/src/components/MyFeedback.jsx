import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, Calendar, MessageSquare, User, Stethoscope, Loader } from "lucide-react";

const MyFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/feedback/my-feedbacks`,
          axiosConfig
        );
        console.log(res)
        setFeedbacks(res.data.feedbacks || []);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // Render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={`${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Get rating text
  const getRatingText = (rating) => {
    const ratingTexts = {
      5: "Excellent",
      4: "Great",
      3: "Good",
      2: "Fair",
      1: "Poor",
    };
    return ratingTexts[rating] || "";
  };

  if (loading) {
    return (

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
              <div className="text-center">
                <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                <p className="text-gray-600 text-lg">Loading your feedbacks...</p>
              </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          My Feedbacks
        </h2>
        <div className="text-center text-gray-600 mt-10 bg-white rounded-lg shadow-md p-12">
          <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg">You haven't given any feedback yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Complete your appointments to share your experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          My Feedbacks
        </h2>
        <p className="text-center text-gray-600 mt-2">
          You have given {feedbacks.length} feedback
          {feedbacks.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {feedbacks.map((feedback) => {
          const doctor = feedback.doctorId;
          const doctorName = doctor?.userId?.name || "Unknown Doctor";
          const specialization = doctor?.specialization || "General";
          const profile = doctor?.userId?.profile || "/default-doctor.png";
          const email = doctor?.userId?.email || "";

          const appointment = feedback.appointmentId;
          const appointmentDate = appointment
            ? new Date(appointment.scheduled_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Date not available";

          return (
            <div
              key={feedback._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Doctor Info Section */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-start gap-4">
                  <img
                    src={profile}
                    alt={doctorName}
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <User size={20} />
                      {doctorName}
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1 flex items-center gap-2">
                      <Stethoscope size={16} />
                      {specialization}
                    </p>
                    {email && (
                      <p className="text-indigo-100 text-xs mt-1">{email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="p-6">
                {/* Rating Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Your Rating
                    </span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {getRatingText(feedback.rating)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderStars(feedback.rating)}
                    <span className="text-2xl font-bold text-gray-800">
                      {feedback.rating}.0
                    </span>
                  </div>
                </div>

                {/* Comment Section */}
                {feedback.comments && (
                  <div className="mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare
                        size={18}
                        className="text-indigo-500 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Your Comment
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          {feedback.comments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment Date */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-indigo-500" />
                    <span>Appointment: {appointmentDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyFeedback;