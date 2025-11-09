import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Camera,
  Upload,
} from "lucide-react";

const UpdateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      setError("Please select an image first");
      return;
    }

    setUploadingImage(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formDataImage = new FormData();
      formDataImage.append("image", profileImage);

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/upload-profile`,
        formDataImage,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },withCredentials:true
        },
      );

      setMessage(
        response.data.message || "Profile image uploaded successfully!"
      );
      setProfileImage(null);
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.message || "Failed to upload profile image."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const validatePassword = (password) => {
    if (!password) return true;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    if (formData.password && !validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/update-user`,
        {
          ...(formData.name && { name: formData.name }),
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.password && { password: formData.password }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(response.data.message || "User details updated successfully!");
      setFormData({
        name: "",
        phone: "",
        password: "",
      });
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.message ||
            "Failed to update user details. Please try again."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "One number", met: /\d/.test(formData.password) },
    {
      label: "One special character",
      met: /[@$!%*?&]/.test(formData.password),
    },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white border-2 border-black p-8 rounded-lg shadow-lg">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-center text-black">
              Update Profile
            </h2>
            <p className="text-gray-600 mt-2 text-center">
              Update your account information
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Image Upload Section */}
            <div className="rounded-lg p-2 ">
              <label className="block text-sm font-medium text-black mb-3"></label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-black"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {profileImage && (
                  <button
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </button>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-black mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-2"
              >
                New Password{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  placeholder="Enter new password"
                />
                <button
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

            {/* Password Requirements */}
            {formData.password && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                <p className="text-sm font-medium text-black mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Password Requirements:
                </p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={`text-sm flex items-center ${
                        req.met ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      <span className="mr-2">{req.met ? "✓" : "○"}</span>
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Messages */}
            {message && (
              <div className="bg-green-50 text-green-800 p-3 rounded-lg border-2 border-green-800 flex items-center">
                <Save className="w-5 h-5 mr-2" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border-2 border-red-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Profile
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Note: Leave fields empty if you don't want to update them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;
