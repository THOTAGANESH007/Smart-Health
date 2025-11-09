import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Calendar,
  Droplet,
  MapPin,
  Activity,
  Heart,
  Candy,
  Save,
  ArrowLeft,
  Loader,
  X,
} from "lucide-react";

const UpdatePatientHealthCards = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    age: "",
    gender: "MALE",
    address: "",
    blood_group: "O+",
    disease_details: {
      bp: "NORMAL",
      diabetes: "NO",
      heart_disease: "NO",
      asthma: "NO",
    },
  });
  const [patientInfo, setPatientInfo] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${baseUrl}/api/patients/get-patient-health-card/${id}`,
        { withCredentials: true }
      );

      if (response.data && response.data.data) {
        const patient = response.data.data;
        setPatientInfo({
          name: patient.userId?.name || "Unknown",
          email: patient.userId?.email || "N/A",
          phone: patient.userId?.phone || "N/A",
          profile: patient.userId?.profile || null,
        });

        setFormData({
          age: patient.age || "",
          gender: patient.gender || "MALE",
          address: patient.address || "",
          blood_group: patient.blood_group || "O+",
          disease_details: {
            bp: patient.disease_details?.bp || "NORMAL",
            diabetes: patient.disease_details?.diabetes || "NO",
            heart_disease: patient.disease_details?.heart_disease || "NO",
            asthma: patient.disease_details?.asthma || "NO",
          },
        });
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError(err.response?.data?.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDiseaseChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      disease_details: {
        ...formData.disease_details,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const response = await axios.put(
        `${baseUrl}/api/patients/update-patient/${id}`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Patient updated successfully!");
        navigate(-1); // Go back to previous page
      }
    } catch (err) {
      console.error("Error updating patient:", err);
      alert(err.response?.data?.message || "Failed to update patient");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "N/A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Update Patient Information
          </h1>
          <p className="text-gray-600">Edit patient health details</p>
        </div>

        {/* Patient Info Card */}
        {patientInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              {patientInfo.profile ? (
                <img
                  src={patientInfo.profile}
                  alt={patientInfo.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-xl flex items-center justify-center border-2 border-blue-500"
                style={{ display: patientInfo.profile ? "none" : "flex" }}
              >
                {getInitials(patientInfo.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {patientInfo.name}
                </h3>
                <p className="text-sm text-gray-600">{patientInfo.email}</p>
                <p className="text-sm text-gray-600">{patientInfo.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-6">
            {/* Personal Details Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-blue-500" size={24} />
                Personal Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="0"
                      max="150"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter age"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Droplet
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Details Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-purple-500" size={24} />
                Medical Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Blood Pressure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Heart
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      name="bp"
                      value={formData.disease_details.bp}
                      onChange={handleDiseaseChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                {/* Diabetes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diabetes <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Candy
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      name="diabetes"
                      value={formData.disease_details.diabetes}
                      onChange={handleDiseaseChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="NO">No</option>
                      <option value="YES">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Heart Disease */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Disease <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Heart
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      name="heart_disease"
                      value={formData.disease_details.heart_disease}
                      onChange={handleDiseaseChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="NO">No</option>
                      <option value="YES">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Asthma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asthma <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Activity
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      name="asthma"
                      value={formData.disease_details.asthma}
                      onChange={handleDiseaseChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="NO">No</option>
                      <option value="YES">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Update Patient
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientHealthCards;