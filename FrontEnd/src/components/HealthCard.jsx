import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Calendar,
  Droplet,
  MapPin,
  Activity,
  Heart,
  Candy,
  Edit2,
  Save,
  X,
  Loader,
} from "lucide-react";

const HealthCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [editData, setEditData] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchHealthCard();
  }, []);

  const fetchHealthCard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user from localStorage
      const userStr = localStorage.getItem("user");
     
      if (!userStr) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.patientId;

      if (!userId) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/patients/get-patient-health-card/${userId}`,
        { withCredentials: true }
      );
     

      if (response.data && response.data.data) {
        const patient = response.data.data;
        
        // Transform data to match component structure
        const transformedData = {
          name: patient.userId?.name || "N/A",
          profile: patient.userId?.profile || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
          email: patient.userId?.email || "N/A",
          phone: patient.userId?.phone || "N/A",
          age: patient.age || 0,
          gender: patient.gender || "OTHERS",
          bloodGroup: patient.blood_group || "O+",
          address: patient.address || "",
          diagnosis: {
            bp: patient.disease_details?.bp !== "NORMAL",
            bpLevel: patient.disease_details?.bp || "NORMAL",
            diabetes: patient.disease_details?.diabetes === "YES",
            heartDisease: patient.disease_details?.heart_disease === "YES",
            asthma: patient.disease_details?.asthma === "YES",
          },
        };

        setPatientData(transformedData);
      }
    } catch (err) {
      console.error("Error fetching health card:", err);
      setError(err.response?.data?.message || "Failed to load health card");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({ ...patientData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);
      const userId = user.patientId;

      // Prepare update data
      const updateData = {
        age: editData.age,
        gender: editData.gender,
        address: editData.address,
        blood_group: editData.bloodGroup,
      };

      await axios.put(
        `${baseUrl}/api/patients/update-patient/${userId}`,
        updateData,
        { withCredentials: true }
      );

      setPatientData({ ...editData });
      setIsEditing(false);
      alert("Health card updated successfully!");
    } catch (err) {
      console.error("Error updating health card:", err);
      alert(err.response?.data?.message || "Failed to update health card");
    }
  };

  const handleCancel = () => {
    setEditData({ ...patientData });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGenderColor = (gender) => {
    if (gender === "MALE") return "text-blue-600 bg-blue-50";
    if (gender === "FEMALE") return "text-pink-600 bg-pink-50";
    return "text-purple-600 bg-purple-50";
  };

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "text-red-600 bg-red-50",
      "A-": "text-red-700 bg-red-100",
      "B+": "text-orange-600 bg-orange-50",
      "B-": "text-orange-700 bg-orange-100",
      "AB+": "text-purple-600 bg-purple-50",
      "AB-": "text-purple-700 bg-purple-100",
      "O+": "text-green-600 bg-green-50",
      "O-": "text-green-700 bg-green-100",
    };
    return colors[bloodGroup] || "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading health card...</p>
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
            onClick={fetchHealthCard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  const displayData = isEditing ? editData : patientData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={displayData.profile}
                  alt={displayData.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="w-24 h-24 rounded-full bg-white text-blue-600 font-bold text-2xl flex items-center justify-center border-4 border-white shadow-lg"
                  style={{ display: "none" }}
                >
                  {getInitials(displayData.name)}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{displayData.name}</h1>
                <div className="flex flex-wrap gap-3">
                  {isEditing ? (
                    <select
                      value={editData.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getGenderColor(
                        editData.gender
                      )}`}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHERS">Others</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getGenderColor(
                        displayData.gender
                      )}`}
                    >
                      {displayData.gender}
                    </span>
                  )}

                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.age}
                      onChange={(e) => handleChange("age", parseInt(e.target.value) || 0)}
                      className="px-3 py-1 rounded-full text-sm font-semibold bg-white text-pink-600 bg-opacity-20 backdrop-blur-sm w-24 text-center"
                      placeholder="Age"
                    />
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white text-pink-500 bg-opacity-20 backdrop-blur-sm">
                      {displayData.age} years
                    </span>
                  )}

                  {isEditing ? (
                    <select
                      value={editData.bloodGroup}
                      onChange={(e) => handleChange("bloodGroup", e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getBloodGroupColor(
                        editData.bloodGroup
                      )}`}
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
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getBloodGroupColor(
                        displayData.bloodGroup
                      )}`}
                    >
                      {displayData.bloodGroup}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-red-500 bg-opacity-20 hover:bg-opacity-30  p-3 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Edit2 size={20} />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600  p-3 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Save size={20} />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-blue-500" size={24} />
                Personal Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Age</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.age}
                        onChange={(e) => handleChange("age", parseInt(e.target.value) || 0)}
                        className="text-lg text-gray-800 border border-gray-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg text-gray-800">{displayData.age} years old</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Droplet className="text-red-500 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Blood Group</p>
                    {isEditing ? (
                      <select
                        value={editData.bloodGroup}
                        onChange={(e) => handleChange("bloodGroup", e.target.value)}
                        className="text-lg text-gray-800 font-semibold border border-gray-300 rounded px-2 py-1 w-full"
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
                    ) : (
                      <p className="text-lg text-gray-800 font-semibold">
                        {displayData.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Address</p>
                    {isEditing ? (
                      <textarea
                        value={editData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="text-gray-800 border border-gray-300 rounded px-2 py-1 w-full resize-none"
                        rows="2"
                      />
                    ) : (
                      <p className="text-gray-800">{displayData.address || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-purple-500" size={24} />
                Medical Diagnosis
                <span className="text-sm font-normal text-gray-500 ml-2">(Read Only)</span>
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    displayData.diagnosis.bp
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Heart
                      className={displayData.diagnosis.bp ? "text-red-500" : "text-gray-400"}
                      size={24}
                    />
                    {displayData.diagnosis.bp && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                        {displayData.diagnosis.bpLevel}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">Blood Pressure</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {displayData.diagnosis.bpLevel}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    displayData.diagnosis.diabetes
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Candy
                      className={
                        displayData.diagnosis.diabetes
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }
                      size={24}
                    />
                    {displayData.diagnosis.diabetes && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">Diabetes</p>
                  <p className="text-xs text-gray-600 mt-1">Blood Sugar</p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    displayData.diagnosis.heartDisease
                      ? "bg-pink-50 border-pink-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Heart
                      className={
                        displayData.diagnosis.heartDisease ? "text-pink-500" : "text-gray-400"
                      }
                      size={24}
                    />
                    {displayData.diagnosis.heartDisease && (
                      <span className="px-2 py-1 bg-pink-500 text-white text-xs rounded-full font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">Heart Disease</p>
                  <p className="text-xs text-gray-600 mt-1">Cardiac Condition</p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    displayData.diagnosis.asthma
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Activity
                      className={
                        displayData.diagnosis.asthma ? "text-blue-500" : "text-gray-400"
                      }
                      size={24}
                    />
                    {displayData.diagnosis.asthma && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">Asthma</p>
                  <p className="text-xs text-gray-600 mt-1">Respiratory</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Health Status:</span>{" "}
                {Object.values(displayData.diagnosis).some((v) => v === true)
                  ? "Under observation for mentioned conditions"
                  : "No major health concerns reported"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCard;