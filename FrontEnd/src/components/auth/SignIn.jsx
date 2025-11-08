import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestForToken } from "../firebase/firebase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signin`,
        { email, password },
        { withCredentials: true } // ✅ required for cookie-based auth
      );

      if (data.user) {
        // Store user info locally
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Get FCM token and save to backend
        try {
          const fcmToken = await requestForToken();
          if (fcmToken) {
            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/auth/save-fcm-token`,
              { fcmToken },
              { withCredentials: true }
            );
          }
        } catch (err) {
          console.error("❌ Failed to save FCM token:", err);
        }

        alert(`✅ Welcome back, ${data.user.name}!`);
        
        // Redirect based on role
        if (data.user.role === "PATIENT") navigate("/patient");
        else if (data.user.role === "DOCTOR") navigate("/doctor");
        else if (data.user.role === "ADMIN") navigate("/admin");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(
        err.response?.data?.message ||
          "⚠️ Network error. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" fill="white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Sign In
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your credentials to access your account
        </p>

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Password Input with Eye Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-transform duration-200 active:scale-90 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center mt-6">
          <button
            onClick={handleForgotPassword}
            className="text-gray-600 hover:text-red-600 font-medium"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
