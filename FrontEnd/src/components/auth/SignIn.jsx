import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Shield } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:7777/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ⬅️ Important to include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        alert(data.message || 'Invalid credentials');
        return;
      }

      alert('Login successful!');
      console.log('User logged in:', data);

      // Example redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      alert('Something went wrong. Please try again later.');
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleForgotPassword = () => {
    // alert('Redirecting to forgot password page...');
    window.location.href = '/forgot-password';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Back Button */}
        {/* <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-base">Back</span>
        </button> */}

        {/* Icon */}
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

        {/* Email Address */}
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
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Password */}
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
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition-colors mb-6 ${
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Forgot your password?{' '}
            <span className="text-red-500 hover:text-red-600 font-medium">
              Reset
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
