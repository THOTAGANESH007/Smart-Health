import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Briefcase, // Icon for Experience
  Users,      // Icon for Consultation Type
} from "lucide-react";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DOCTOR",
    phone: "",
    specialization: "",
    experience_years: "", // <-- ADDED FIELD
    consultation_type: "BOTH", // <-- ADDED FIELD with default
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Fetch all doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/api/admin/getAllDoctors`, axiosConfig);
      console.log(res)
      setDoctors(res.data.doctors || res.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  // Reset form state utility
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "DOCTOR",
      phone: "",
      specialization: "",
      experience_years: "", // <-- RESET ADDED FIELD
      consultation_type: "BOTH", // <-- RESET ADDED FIELD
    });
    setFormErrors({});
  };

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.specialization.trim()) {
      errors.specialization = "Specialization is required";
    }
    
    // <-- VALIDATION FOR NEW FIELDS -->
    if (!formData.experience_years) {
      errors.experience_years = "Years of experience is required";
    } else if (isNaN(formData.experience_years) || Number(formData.experience_years) < 0) {
      errors.experience_years = "Please enter a valid number of years";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      // <-- ADDED FIELDS IN PAYLOAD -->
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        specialization: formData.specialization,
        experience_years: Number(formData.experience_years), 
        consultation_type: formData.consultation_type, 
      };

      const response = await axios.post(
        `${baseUrl}/api/admin/create-user`,
        payload,
        axiosConfig
      );

      if (response.status === 200 || response.status === 201) {
        alert("Doctor added successfully!");
        closeModal();
        fetchDoctors(); // Refresh the list
      }
    } catch (err) {
      console.error("Error adding doctor:", err);
      alert(err.response?.data?.message || "Failed to add doctor");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete doctor
  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/api/admin/delete-doctor/${doctorId}`,
        axiosConfig
      );

      if (response.status === 200) {
        alert("Doctor deleted successfully!");
        fetchDoctors(); // Refresh the list
      }
    } catch (err) {
      console.error("Error deleting doctor:", err);
      alert(err.response?.data?.message || "Failed to delete doctor");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Loading doctors...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Doctors</h2>
          <p className="text-gray-600 mt-1">
            Total Doctors: {doctors.length}
          </p>
        </div>

        <button
          onClick={openModal}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center text-gray-600 mt-10 bg-white rounded-lg shadow-md p-12">
          <Stethoscope size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No doctors found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {doctors.map((doctor) => {
            const doctorName = doctor.userId?.name || doctor.name || "Unknown";
            const email = doctor.userId?.email || doctor.email || "N/A";
            const phone = doctor.userId?.phone || doctor.phone || "N/A";
            const specialization = doctor.specialization || "General";
            const experience = doctor.experience_years; // <-- GET NEW FIELD
            const consultationType = doctor.consultation_type || "BOTH"; // <-- GET NEW FIELD
            const profile = doctor.userId?.profile || doctor.profile || "/default-doctor.png";

            return (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 relative group"
              >
                <button
                  onClick={() => handleDelete(doctor.userId._id)}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 z-10"
                  title="Delete Doctor"
                >
                  <Trash2 size={16} />
                </button>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
                  <img
                    src={profile}
                    alt={doctorName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
                    {doctorName}
                  </h3>
                  <p className="text-indigo-600 font-medium text-center text-sm mb-3">
                    {specialization}
                  </p>
                  
                  {/* <-- DISPLAY FOR NEW FIELDS --> */}
                  <div className="flex justify-center items-center gap-4 text-xs text-gray-600 mb-4">
                    {experience !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-gray-400" />
                        <span>{experience} years exp.</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      <span className="capitalize">{consultationType.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="text-indigo-500 flex-shrink-0" />
                      <span>{phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Doctor</h3>
              <p className="text-gray-600 text-sm">Fill in the details to add a new doctor.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@example.com"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="Cardiology, Neurology, etc."
                    className={`w-full pl-10 pr-4 py-2 border ${
                      formErrors.specialization
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                </div>
                {formErrors.specialization && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.specialization}
                  </p>
                )}
              </div>

              {/* <-- Experience Years - NEW FIELD --> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      formErrors.experience_years ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                </div>
                {formErrors.experience_years && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.experience_years}</p>
                )}
              </div>
              
              {/* <-- Consultation Type - NEW FIELD --> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Type
                </label>
                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <select
                    name="consultation_type"
                    value={formData.consultation_type}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="BOTH">Both</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border ${
                      formErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-6"
              >
                {submitting ? "Adding Doctor..." : "Add Doctor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;