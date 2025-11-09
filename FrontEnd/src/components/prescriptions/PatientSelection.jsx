import React from "react";
import {
  User,
  Mail,
  Shield,
  Droplets,
  MapPin,
  ActivitySquare,
} from "lucide-react";

const PatientSelection = ({ patients, onSelect }) => {
  return (
    <div className="animate-fadeIn">
      {/* Heading */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-black tracking-tight">
          Select a Patient
        </h3>
        <p className="text-gray-500 mt-2 text-sm">
          Choose a patient below to create or view their prescription.
        </p>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((p) => (
          <div
            key={p._id}
            onClick={() => onSelect(p)}
            className="group relative border-2 border-gray-200 rounded-2xl p-5 bg-gradient-to-b from-white to-gray-50 
                       cursor-pointer shadow-sm hover:shadow-xl hover:border-black transition-all duration-300"
          >
            {/* Hover Highlight Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/40 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-500" />

            {/* User Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
               {p.userId.profile ?(p.userId.profile):(<div className="bg-black text-white p-2 rounded-full">
                  <User className="w-5 h-5" />
                </div>)}
                <h4 className="font-semibold text-lg text-black">
                  {p.userId?.name || "Unnamed"}
                </h4>
              </div>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                {p.gender || "N/A"}
              </span>
            </div>

            {/* Details Section */}
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                {p.userId?.email}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-gray-500" />
                Age: {p.age || "N/A"}
              </p>
              {p.blood_group && (
                <p className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-gray-500" />
                  Blood Group: {p.blood_group}
                </p>
              )}
              {p.address && (
                <p className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {p.address}
                </p>
              )}
              

            </div>

            {/* Select Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(p);
              }}
              className="mt-4 w-full bg-black text-white py-2 text-sm rounded-md font-medium hover:bg-gray-800 transition-all"
            >
              Select Patient
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {patients.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <User className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">No patients available.</p>
          <p className="text-sm text-gray-400">
            Once patients register, they’ll appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientSelection;
