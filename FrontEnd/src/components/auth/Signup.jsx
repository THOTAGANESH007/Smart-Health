import React, { useState } from 'react';
import { Mail, Lock, Shield, User, Phone } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    const { name, email, role, phone, password, confirmPassword } = formData;

    // Basic validation
    if (!name || !email || !role || !phone || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:7777/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          phone,
          password
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert('✅ Account created successfully!');
        console.log('Signup success:', data);

        // Reset form
        setFormData({
          name: '',
          email: '',
          role: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });

        // Redirect to sign-in page
        window.location.href = '/signin';
      } else {
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Signup error:', err);
      alert('⚠️ Network error. Please check your connection.');
    }
  };

  const handleSigninRedirect = () => {
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" fill="white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Sign Up
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create your account to get started
        </p>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
              text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
              text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Role */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Role
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
              text-gray-900 appearance-none bg-white"
            >
              <option value="">Select your role</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PATIENT">Patient</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
              text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
              text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
              text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Sign Up Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium 
          hover:bg-gray-800 transition-colors mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-gray-600">
            Already have an account?{' '}
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
