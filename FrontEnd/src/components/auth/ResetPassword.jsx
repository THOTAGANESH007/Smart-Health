import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    // ✅ Client-side validations
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long!");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`,
        {
          email,
          newPassword,
          confirmPassword,
        }
      );

      setMessage(response.data.message || "Password reset successfully!");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");

      // ✅ Redirect to login after 1.5 seconds
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(
          err.response.data.message ||
            "Failed to reset password. Please try again."
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
            <div className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-center text-black">
              Reset Password
            </h2>
            <p className="text-gray-600 mt-2 text-center">
              Create a new password for your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-black mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-black mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-gray-600">
              <p className="mb-1 font-medium">Password must:</p>
              <ul className="space-y-1 ml-4">
                <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
                  • Be at least 8 characters long
                </li>
                <li
                  className={
                    newPassword === confirmPassword && newPassword
                      ? "text-green-600"
                      : ""
                  }
                >
                  • Match confirmation password
                </li>
              </ul>
            </div>

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 text-green-800 p-3 rounded-lg border-2 border-green-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border-2 border-red-800">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
