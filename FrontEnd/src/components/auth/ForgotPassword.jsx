import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ Correct hook for navigation

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`,
        {
          email,
        }
      );

      // If response is successful
      setMessage(
        response.data.message || "OTP sent to your email successfully!"
      );
      setEmail("");
      navigate("/verify-otp"); // ✅ Correct navigation
    } catch (err) {
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || "Failed to send OTP. Please try again."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 p-8 rounded-lg shadow-lg">
          <div className="mb-6">
            <button
              className="flex items-center text-gray-600 hover:text-black transition-colors mb-4"
              onClick={() => navigate("/signin")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to login
            </button>
            <h2 className="text-3xl font-bold text-black">Forgot Password</h2>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {message && (
              <div className="bg-green-50 text-green-800 p-3 rounded-lg border-2 border-green-800">
                <p className="text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border-2 border-red-800">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
