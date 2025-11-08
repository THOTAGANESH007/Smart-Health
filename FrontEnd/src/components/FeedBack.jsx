import React, { useEffect, useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const Feedback = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    rating: 0,
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // ✅ Fetch doctors list on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/getAllDoctors`,
          { withCredentials: true }
        );

        // Transform to only { userId, name }
        const transformedDoctors =
          res.data.doctors?.map((doc) => ({
            userId: doc._id || '',
            name: doc.userId?.name || 'Unknown',
          })) || [];

        setDoctors(transformedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  // ✅ Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle star rating click
  const handleRatingClick = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  // ✅ Submit feedback to backend
  const handleSubmit = async () => {
    const { doctorId, rating, comment } = formData;
    
    // Validation
    if (!doctorId) return alert('Please select a doctor');
    if (rating === 0) return alert('Please provide a rating');
    if (!comment.trim()) return alert('Please write a review');

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/feedback/${doctorId}`,
        { rating, comment },
        { withCredentials: true }
      );

      console.log('✅ Feedback submitted:', res.data);

      // Reset form after successful submission
      setFormData({
        doctorId: '',
        rating: 0,
        comment: '',
      });

      setSubmitSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Share Your Feedback</h2>
        <p className="text-gray-600 mb-6">Help us improve by sharing your experience</p>

        <div className="space-y-6">
          {/* Doctor Selection */}
          <div>
            <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isSubmitting}
            >
              <option value="">-- Select a Doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="focus:outline-none transition-transform hover:scale-110 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || formData.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review / Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows="5"
              placeholder="Share your experience with the doctor..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.comment.length} / 500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Feedback submitted successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
