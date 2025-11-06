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
} from "lucide-react";

const PatientLabTests = () => {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expandedTest, setExpandedTest] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Retrieve patientId from localStorage (set at login)
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.patientId;

  const fetchTests = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/labtests/patient/${patientId}`,
        axiosConfig
      );
      setTests(res.data.tests || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your lab tests");
    }
  };

  useEffect(() => {
    if (patientId) fetchTests();
  }, [patientId]);

  const downloadReport = (url) => window.open(url, "_blank");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white border-2 border-black p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
            <FileSearch className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-black">My Lab Tests</h2>
          <p className="text-gray-600 mt-1">
            View detailed test results and download your reports
          </p>
        </div>

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

        {/* Test Cards */}
        {tests.length === 0 ? (
          <p className="text-center text-gray-600">No lab tests found.</p>
        ) : (
          <div className="space-y-4">
            {tests.map((t) => (
              <div
                key={t._id}
                className="border-2 border-gray-300 p-4 rounded-lg"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" /> {t.diagnosis || "N/A"}
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />{" "}
                      {new Date(t.test_date).toLocaleString()}
                    </p>
                    <p className="text-gray-700">
                      Remarks:{" "}
                      <span className="font-medium">
                        {t.remarks || "No remarks"}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Status:{" "}
                      <strong
                        className={
                          t.status === "COMPLETED"
                            ? "text-green-700"
                            : "text-yellow-600"
                        }
                      >
                        {t.status}
                      </strong>
                    </p>
                  </div>

                  {t.file_url && (
                    <button
                      onClick={() => downloadReport(t.file_url)}
                      className="bg-black text-white px-4 py-2 rounded-lg mt-3 md:mt-0 hover:bg-gray-800"
                    >
                      Download Report
                    </button>
                  )}
                </div>

                {/* Expandable test_results */}
                {t.test_results && t.test_results.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedTest(expandedTest === t._id ? null : t._id)
                      }
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      {expandedTest === t._id ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Hide Results
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View Test Results
                        </>
                      )}
                    </button>

                    {expandedTest === t._id && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-left border-b border-gray-300">
                              <th className="p-2">Test Name</th>
                              <th className="p-2">Result</th>
                              <th className="p-2">Normal Range</th>
                              <th className="p-2">Units</th>
                              <th className="p-2">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {t.test_results.map((r, i) => (
                              <tr
                                key={i}
                                className="border-b border-gray-200 text-gray-700"
                              >
                                <td className="p-2">{r.test_name}</td>
                                <td className="p-2">{r.result || "-"}</td>
                                <td className="p-2">{r.normal_range || "-"}</td>
                                <td className="p-2">{r.units || "-"}</td>
                                <td className="p-2">{r.remarks || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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

export default PatientLabTests;
