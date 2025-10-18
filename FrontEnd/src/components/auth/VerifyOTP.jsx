import React, { useState } from 'react';
import { Mail, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ✅ For navigation

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:7777/api/auth/verify-forgot-password-otp', {
        email,
        otp,
      });

      setMessage(response.data.message || 'OTP verified successfully!');
      // ✅ Redirect to reset password page after verification
      setTimeout(() => navigate('/reset-password'), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Invalid OTP. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:7777/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'OTP resent successfully!');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to resend OTP.');
      } else {
        setError('Network error. Please check your connection.');
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
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-black transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>

            <div className="flex items-center justify-center w-16 h-16 bg-red-500 text-white rounded-full mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>

            <h2 className="text-3xl font-bold text-center text-black">Verify OTP</h2>
            <p className="text-gray-600 mt-2 text-center">
              Enter the OTP sent to your email address
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
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

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-black mb-2">
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 bg-white text-black text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                placeholder="000000"
                required
              />
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
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
