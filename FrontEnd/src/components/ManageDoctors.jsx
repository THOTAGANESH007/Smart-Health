import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  Briefcase,
  Users,
  Edit,
} from "lucide-react";

const ManageDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DOCTOR",
    phone: "",
    specialization: "",
    experience_years: "",
    consultation_type: "BOTH",
  });
  const [updateFormData, setUpdateFormData] = useState({
    specialization: "",
    experience_years: "",
    consultation_type: "BOTH",
  });
  const [formErrors, setFormErrors] = useState({});
  const [updateFormErrors, setUpdateFormErrors] = useState({});
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
      setDoctors(res.data.doctors || res.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "DOCTOR",
      phone: "",
      specialization: "",
      experience_years: "",
      consultation_type: "BOTH",
    });
    setFormErrors({});
  };

  const resetUpdateForm = () => {
    setUpdateFormData({
      specialization: "",
      experience_years: "",
      consultation_type: "BOTH",
    });
    setUpdateFormErrors({});
    setSelectedDoctor(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openUpdateModal = (doctor) => {
    setSelectedDoctor(doctor);
    setUpdateFormData({
      specialization: doctor.specialization || "",
      experience_years: doctor.experience_years || "",
      consultation_type: doctor.consultation_type || "BOTH",
    });
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    resetUpdateForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({ ...updateFormData, [name]: value });
    if (updateFormErrors[name]) {
      setUpdateFormErrors({ ...updateFormErrors, [name]: "" });
    }
  };

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

    if (!formData.experience_years) {
      errors.experience_years = "Years of experience is required";
    } else if (isNaN(formData.experience_years) || Number(formData.experience_years) < 0) {
      errors.experience_years = "Please enter a valid number of years";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpdateForm = () => {
    const errors = {};

    if (!updateFormData.specialization.trim()) {
      errors.specialization = "Specialization is required";
    }

    if (!updateFormData.experience_years) {
      errors.experience_years = "Years of experience is required";
    } else if (isNaN(updateFormData.experience_years) || Number(updateFormData.experience_years) < 0) {
      errors.experience_years = "Please enter a valid number of years";
    }

    setUpdateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
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
        setIsModalOpen(false);
        resetForm();
        fetchDoctors();
      }
    } catch (err) {
      console.error("Error adding doctor:", err);
      alert(err.response?.data?.message || "Failed to add doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!validateUpdateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        specialization: updateFormData.specialization,
        experience_years: Number(updateFormData.experience_years),
        consultation_type: updateFormData.consultation_type,
      };

      const response = await axios.patch(
        `${baseUrl}/api/admin/update-doctor/${selectedDoctor._id}`,
        payload,
        axiosConfig
      );

      if (response.status === 200) {
        alert("Doctor updated successfully!");
        closeUpdateModal();
        fetchDoctors();
      }
    } catch (err) {
      console.error("Error updating doctor:", err);
      alert(err.response?.data?.message || "Failed to update doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/api/admin/delete-doctor/${doctorId}`,
        axiosConfig
      );

      if (response.status === 200) {
        alert("Doctor deleted successfully!");
        fetchDoctors();
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
          <p className="text-gray-600 mt-1">Total Doctors: {doctors.length}</p>
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
            const experience = doctor.experience_years;
            const consultationType = doctor.consultation_type || "BOTH";
            const profile = doctor.userId?.profile || doctor.profile || "/default-doctor.png";

            return (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 relative group"
              >
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button
                    onClick={() => openUpdateModal(doctor)}
                    className="bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-600"
                    title="Edit Doctor"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.userId._id)}
                    className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                    title="Delete Doctor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

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

                  <div className="flex justify-center items-center gap-4 text-xs text-gray-600 mb-4">
                    {experience !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-gray-400" />
                        <span>{experience} years exp.</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      <span className="capitalize">
                        {consultationType.toLowerCase()}
                      </span>
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

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 shadow-md hover:shadow-lg z-10"
              title="Close"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-gray-800">Add New Doctor</h3>
              <p className="text-gray-600 text-sm">
                Fill in the details to add a new doctor.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                </div>
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
              </div>

              {/* Phone */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number (Optional)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Specialization & Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="Specialization"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    />
                  </div>
                  {formErrors.specialization && <p className="text-red-500 text-xs mt-1">{formErrors.specialization}</p>}
                </div>
                <div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      placeholder="Experience (Yrs)"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    />
                  </div>
                  {formErrors.experience_years && <p className="text-red-500 text-xs mt-1">{formErrors.experience_years}</p>}
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <select
                  name="consultation_type"
                  value={formData.consultation_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="BOTH">Both (Online & In-Person)</option>
                  <option value="ONLINE">Online Only</option>
                  <option value="OFFLINE">In-Person Only</option>
                </select>
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

      {/* Update Doctor Modal */}
      {isUpdateModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-8">
            <button
              onClick={closeUpdateModal}
              className="absolute top-4 right-4 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 shadow-md hover:shadow-lg z-10"
              title="Close"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-gray-800">Update Doctor</h3>
              <p className="text-gray-600 text-sm">
                Update doctor's professional information.
              </p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={selectedDoctor.userId?.name || selectedDoctor.name || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={selectedDoctor.userId?.email || selectedDoctor.email || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={selectedDoctor.userId?.phone || selectedDoctor.phone || "N/A"}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Specialization (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="specialization"
                    value={updateFormData.specialization}
                    onChange={handleUpdateInputChange}
                    placeholder="Specialization"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                </div>
                {updateFormErrors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{updateFormErrors.specialization}</p>
                )}
              </div>

              {/* Experience (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="experience_years"
                    value={updateFormData.experience_years}
                    onChange={handleUpdateInputChange}
                    placeholder="Experience (Yrs)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  />
                </div>
                {updateFormErrors.experience_years && (
                  <p className="text-red-500 text-xs mt-1">{updateFormErrors.experience_years}</p>
                )}
              </div>

              {/* Consultation Type (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                <select
                  name="consultation_type"
                  value={updateFormData.consultation_type}
                  onChange={handleUpdateInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="BOTH">Both (Online & In-Person)</option>
                  <option value="ONLINE">Online Only</option>
                  <option value="OFFLINE">In-Person Only</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-6"
              >
                {submitting ? "Updating Doctor..." : "Update Doctor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;