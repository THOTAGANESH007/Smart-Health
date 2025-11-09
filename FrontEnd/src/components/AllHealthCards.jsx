import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Search,
  Loader,
  Heart,
  Candy,
  Activity,
  Droplet,
  Calendar,
  MapPin,
  Mail,
  Phone,
  X,
  Edit,
} from "lucide-react";

const AllHealthCards = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchAllHealthCards();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) => {
        const name = patient.userId?.name?.toLowerCase() || "";
        return name.includes(searchQuery.toLowerCase());
      });
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchAllHealthCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${baseUrl}/api/admin/get-all-patients-health-cards`,
        { withCredentials: true }
      );

      if (response.data && response.data.patients) {
        setPatients(response.data.patients);
        setFilteredPatients(response.data.patients);
      }
    } catch (err) {
      console.error("Error fetching health cards:", err);
      setError(err.response?.data?.message || "Failed to load health cards");
    } finally {
      setLoading(false);
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

  const getBPColor = (bp) => {
    if (bp === "HIGH") return "bg-red-500";
    if (bp === "LOW") return "bg-blue-500";
    return "bg-green-500";
  };

  const handleUpdateClick = (patientId) => {
    navigate(`/doctor/update-patient/${patientId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading health cards...</p>
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
            onClick={fetchAllHealthCards}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        </div>

        {/* Health Cards Grid */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <User className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Patients Found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try adjusting your search query"
                : "No patient health cards available"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => {
              const name = patient.userId?.name || "Unknown Patient";
              const email = patient.userId?.email || "N/A";
              const phone = patient.userId?.phone || "N/A";
              const profile =
                patient.userId?.profile ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop";

              return (
                <div
                  key={patient._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 text-white">
                    <div className="flex items-center gap-4">
                      <img
                        src={profile}
                        alt={name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-16 h-16 rounded-full bg-white text-blue-600 font-bold text-lg flex items-center justify-center border-2 border-white shadow-lg"
                        style={{ display: "none" }}
                      >
                        {getInitials(name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGenderColor(
                              patient.gender
                            )}`}
                          >
                            {patient.gender || "N/A"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-pink-500 bg-opacity-20">
                            {patient.age || "N/A"} yrs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="truncate">{email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-green-500 flex-shrink-0" />
                        <span>{phone}</span>
                      </div>
                    </div>

                    {/* Blood Group & Age */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Droplet size={16} className="text-red-500" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Group</p>
                          <p
                            className={`text-sm font-semibold ${
                              getBloodGroupColor(patient.blood_group).split(" ")[0]
                            }`}
                          >
                            {patient.blood_group || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Calendar size={16} className="text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {patient.age || "N/A"} years
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                      <MapPin size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Address</p>
                        <p className="text-sm text-gray-800 line-clamp-2">
                          {patient.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Medical Conditions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {/* BP */}
                        <div
                          className={`p-2 rounded-lg border ${
                            patient.disease_details?.bp !== "NORMAL"
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Heart
                              size={16}
                              className={
                                patient.disease_details?.bp !== "NORMAL"
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }
                            />
                            {patient.disease_details?.bp !== "NORMAL" && (
                              <span
                                className={`px-1.5 py-0.5 ${getBPColor(
                                  patient.disease_details?.bp
                                )} text-white text-xs rounded-full font-semibold`}
                              >
                                {patient.disease_details?.bp}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mt-1">
                            Blood Pressure
                          </p>
                        </div>

                        {/* Diabetes */}
                        <div
                          className={`p-2 rounded-lg border ${
                            patient.disease_details?.diabetes === "YES"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Candy
                              size={16}
                              className={
                                patient.disease_details?.diabetes === "YES"
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }
                            />
                            {patient.disease_details?.diabetes === "YES" && (
                              <span className="px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full font-semibold">
                                YES
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mt-1">
                            Diabetes
                          </p>
                        </div>

                        {/* Heart Disease */}
                        <div
                          className={`p-2 rounded-lg border ${
                            patient.disease_details?.heart_disease === "YES"
                              ? "bg-pink-50 border-pink-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Heart
                              size={16}
                              className={
                                patient.disease_details?.heart_disease === "YES"
                                  ? "text-pink-500"
                                  : "text-gray-400"
                              }
                            />
                            {patient.disease_details?.heart_disease === "YES" && (
                              <span className="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full font-semibold">
                                YES
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mt-1">
                            Heart Disease
                          </p>
                        </div>

                        {/* Asthma */}
                        <div
                          className={`p-2 rounded-lg border ${
                            patient.disease_details?.asthma === "YES"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Activity
                              size={16}
                              className={
                                patient.disease_details?.asthma === "YES"
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }
                            />
                            {patient.disease_details?.asthma === "YES" && (
                              <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
                                YES
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mt-1">
                            Asthma
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Update Button */}
                    <button
                      onClick={() => handleUpdateClick(patient._id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Update Patient
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllHealthCards;