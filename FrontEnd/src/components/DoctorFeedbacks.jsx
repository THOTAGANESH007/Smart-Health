import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Star, MessageSquare, UserCircle, Loader2 } from 'lucide-react';

// Helper component to render star ratings safely and correctly
const StarRating = ({ rating = 0, size = 'h-5 w-5' }) => {
  // Ensure the rating is a number and is capped between 0 and 5
  const safeRating = Math.max(0, Math.min(5, Number(rating)));

  const totalStars = 5;
  const fullStars = Math.floor(safeRating);
  const emptyStars = totalStars - fullStars;

  return (
    <div className="flex items-center">
      {/* Render full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${size} text-yellow-400 fill-current`} />
      ))}
      {/* Render empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
      ))}
    </div>
  );
};

const DoctorFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const doctorId = userData?.doctorId;

        if (!doctorId) {
          setError('Doctor ID not found in local storage.');
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/feedback/doctor/${doctorId}`
        );
        
        // The response is { feedbacks: [...] }, so we set the feedbacks array
        setFeedbacks(res.data.feedbacks || []);

      } catch (err) {
        setError('Failed to fetch feedback. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
        <span className="ml-4 text-gray-600 text-lg">Loading Feedback...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 p-8 bg-red-50 rounded-lg">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Patient Feedback</h1>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-10 rounded-xl shadow-md">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg">No feedback has been submitted for this doctor yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback) => {
            // Safely access the patient's name with a fallback
            const patientName = feedback.patientId?.userId?.name || 'Anonymous';

            return (
              <div
                key={feedback._id}
                className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <UserCircle className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className='w-full'>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-gray-900 text-lg">{patientName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(feedback.createdAt), 'dd MMMM yyyy')}
                      </p>
                    </div>
                    <StarRating rating={feedback.rating} />
                    
                    {/* Only display the comments section if comments exist */}
                    {feedback.comments?.trim() && (
                      <p className="text-gray-700 mt-3 italic">
                        "{feedback.comments}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorFeedback;