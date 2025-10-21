import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        "http://localhost:7777/api/auth/signin",
        { email, password },
        { withCredentials: true } // ✅ required for cookie-based auth
      );

      setLoading(false);

      if (data.user) {
        // store basic user info (not token)
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`✅ Welcome back, ${data.user.name}!`);
        navigate("/analytics");
      }
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);

      if (err.response) {
        alert(err.response.data.message || "Invalid credentials");
      } else {
        alert("⚠️ Network error. Please check your connection.");
      }
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" fill="white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Sign In
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your credentials to access your account
        </p>

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

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

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
