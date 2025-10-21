import React, { useState } from "react";
import { Mail, Lock, Shield, User, Phone } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, email, role, phone, password, confirmPassword } = formData;

    if (!name || !email || !role || !phone || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:7777/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, phone, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("✅ Account created successfully!");

        // ✅ Store token if returned
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Redirect to dashboard or login page
        window.location.href = "/signin";
      } else {
        alert(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Signup error:", err);
      alert("⚠️ Network error. Please check your connection.");
    }
  };

  const handleSigninRedirect = () => {
    window.location.href = "/signin";
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
          Sign Up
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create your account to get started
        </p>

        {/* Fields */}
        {["name", "email", "role", "phone", "password", "confirmPassword"].map(
          (field) => (
            <div key={field} className="mb-5">
              {/* Dynamic Input Fields */}
              {/* Add your own logic like before */}
            </div>
          )
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="text-center">
          <span className="text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={handleSigninRedirect}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Sign In
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
