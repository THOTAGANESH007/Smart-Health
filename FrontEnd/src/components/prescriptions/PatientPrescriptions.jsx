import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileSearch,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expandedPrescription, setExpandedPrescription] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Retrieve patientId from localStorage (from login)
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.patientId;

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/prescriptions/getAllPrescriptions/${patientId}`,
        axiosConfig
      );
      console.log(res)
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your prescriptions");
    }
  };

  useEffect(() => {
    if (patientId) fetchPrescriptions();
  }, [patientId]);

  const downloadReport = (url) => window.open(url, "_blank");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white border-2 border-black p-8 rounded-lg shadow-lg">
       

        {/* Notifications */}
        {message && (
          <div className="bg-green-50 text-green-800 p-3 mb-3 rounded-lg border-2 border-green-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-800 p-3 mb-3 rounded-lg border-2 border-red-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Prescription List */}
        {prescriptions.length === 0 ? (
          <p className="text-center text-gray-600">No prescriptions found.</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div
                key={p._id}
                className="border-2 border-gray-300 p-4 rounded-lg"
              >
                {/* Summary Info */}
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />{" "}
                      {p.diagnosis || "General Prescription"}
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />{" "}
                      {new Date(p.prescription_date).toLocaleString()}
                    </p>
                    <p className="text-gray-700">
                      Signed:{" "}
                      <strong
                        className={
                          p.signed ? "text-green-700" : "text-yellow-600"
                        }
                      >
                        {p.signed ? "Yes" : "No"}
                      </strong>
                    </p>
                  </div>

                  {p.file_url && (
                    <button
                      onClick={() => downloadReport(p.file_url)}
                      className="bg-black text-white px-3 py-1.5 text-sm rounded-md mt-3 md:mt-0 hover:bg-gray-800 transition-all"
                    >
                      Download
                    </button>
                  )}
                </div>

                {/* Expandable Medications */}
                {p.medications && p.medications.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedPrescription(
                          expandedPrescription === p._id ? null : p._id
                        )
                      }
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      {expandedPrescription === p._id ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Hide Medications
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View Medications
                        </>
                      )}
                    </button>

                    {expandedPrescription === p._id && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-left border-b border-gray-300">
                              <th className="p-2">Medicine Name</th>
                              <th className="p-2">Dosage</th>
                              <th className="p-2">Frequency</th>
                              <th className="p-2">Duration</th>
                              <th className="p-2">Route</th>
                              <th className="p-2">Instructions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.medications.map((m, i) => (
                              <tr
                                key={i}
                                className="border-b border-gray-200 text-gray-700"
                              >
                                <td className="p-2">{m.medicine_name}</td>
                                <td className="p-2">{m.dosage}</td>
                                <td className="p-2">{m.frequency}</td>
                                <td className="p-2">{m.duration}</td>
                                <td className="p-2">{m.route}</td>
                                <td className="p-2">{m.instructions || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Precautions */}
                {p.precautions && p.precautions.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-3">
                    <h4 className="font-semibold flex items-center gap-2 text-red-700 mb-2">
                      <ShieldAlert className="w-5 h-5" /> Precautions
                    </h4>
                    <ul className="list-disc ml-6 text-gray-700">
                      {p.precautions.map((prec, i) => (
                        <li key={i}>{prec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPrescriptions;
