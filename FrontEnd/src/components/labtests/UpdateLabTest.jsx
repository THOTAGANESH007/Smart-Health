import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FlaskRound,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  PlusCircle,
  Trash2,
} from "lucide-react";

const UpdateLabTest = () => {
  const [labTests, setLabTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Fetch all lab tests
  const fetchLabTests = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/labtests/all`, axiosConfig);
      setLabTests(res.data.tests || []);
    } catch {
      setError("Failed to load lab tests");
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  // Add new test result row
  const addResultRow = () => {
    setTestResults([
      ...testResults,
      { test_name: "", result: "", normal_range: "", units: "", remarks: "" },
    ]);
  };

  // Update test result
  const updateResult = (index, field, value) => {
    const updated = [...testResults];
    updated[index][field] = value;
    setTestResults(updated);
  };

  // Remove test result row
  const removeResult = (index) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  // Submit completion
  const handleComplete = async () => {
    if (!selectedTest) return alert("Select a lab test first.");
    if (testResults.length === 0)
      return alert("Add at least one test result before completing.");
    setUpdating(true);
    try {
      await axios.put(
        `${baseUrl}/api/labtests/complete/${selectedTest._id}`,
        { test_results: testResults, remarks },
        axiosConfig
      );
      setMessage("✅ Lab Test marked as completed and PDF generated!");
      setSelectedTest(null);
      setTestResults([]);
      setRemarks("");
      fetchLabTests();
    } catch {
      setError("❌ Failed to complete lab test");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white border-2 border-black p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
            <FlaskRound className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-black">Technician Panel</h2>
          <p className="text-gray-600 mt-1">Update and Complete Lab Tests</p>
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

        {/* Step 1: Select a test to update */}
        <div className="mb-6">
          <label className="font-semibold block mb-2">Select Lab Test</label>
          <select
            value={selectedTest?._id || ""}
            onChange={(e) => {
              const test = labTests.find((t) => t._id === e.target.value);
              setSelectedTest(test);
              setTestResults(test?.test_results || []);
              setRemarks(test?.remarks || "");
            }}
            className="border-2 border-gray-300 p-2 rounded-lg w-full"
          >
            <option value="">-- Choose a Pending Test --</option>
            {labTests
              .filter((t) => t.status !== "COMPLETED")
              .map((t) => (
                <option key={t._id} value={t._id}>
                  {t.patientId?.userId?.name || "Unknown"} - {t.diagnosis}
                </option>
              ))}
          </select>
        </div>

        {/* Step 2: Enter Test Results */}
        {selectedTest && (
          <div className="border-2 border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">
              Enter Test Results for {selectedTest?.diagnosis}
            </h3>

            {testResults.map((tr, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Test Name"
                  value={tr.test_name}
                  onChange={(e) => updateResult(i, "test_name", e.target.value)}
                  className="border-2 border-gray-300 p-2 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Result"
                  value={tr.result}
                  onChange={(e) => updateResult(i, "result", e.target.value)}
                  className="border-2 border-gray-300 p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Normal Range"
                  value={tr.normal_range}
                  onChange={(e) =>
                    updateResult(i, "normal_range", e.target.value)
                  }
                  className="border-2 border-gray-300 p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Units"
                  value={tr.units}
                  onChange={(e) => updateResult(i, "units", e.target.value)}
                  className="border-2 border-gray-300 p-2 rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={tr.remarks}
                    onChange={(e) => updateResult(i, "remarks", e.target.value)}
                    className="border-2 border-gray-300 p-2 rounded-lg w-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeResult(i)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addResultRow}
              className="mt-2 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-black flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Test Result
            </button>

            <div className="mt-4">
              <label className="block font-semibold mb-1">Remarks:</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border-2 border-gray-300 rounded-lg w-full p-2"
                rows="3"
                placeholder="Enter final remarks..."
              />
            </div>

            <button
              onClick={handleComplete}
              disabled={updating}
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              {updating ? "Completing..." : "Mark Test as Completed"}
            </button>
          </div>
        )}

        {/* Step 3: Completed Tests */}
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-xl font-semibold mb-3">Completed Lab Tests</h3>
          <div className="space-y-3">
            {labTests
              .filter((t) => t.status === "COMPLETED")
              .map((t) => (
                <div
                  key={t._id}
                  className="border-2 border-gray-300 p-4 rounded-lg flex flex-col md:flex-row justify-between"
                >
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />{" "}
                      {t.diagnosis || "No Diagnosis"}
                    </p>
                    <p className="text-gray-700">
                      Patient: {t.patientId?.userId?.name || "Unknown"}
                    </p>
                    <p className="text-gray-700">Status: {t.status}</p>
                  </div>
                  {t.file_url && (
                    <a
                      href={t.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 mt-2 md:mt-0 hover:underline"
                    >
                      Download Report
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLabTest;
