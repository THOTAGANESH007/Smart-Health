import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FlaskConical,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Trash2,
} from "lucide-react";

const CreateLabTest = () => {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [formData, setFormData] = useState({
    diagnosis: "",
    remarks: "",
    test_results: [],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // Fetch Lab Tests
  const fetchLabTests = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/labtests/all`, axiosConfig);
      setLabTests(res.data.tests || []);
    } catch {
      setError("Failed to load lab tests");
    }
  };

  // Fetch Patients
  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/patients/getall-patients`,
        axiosConfig
      );
      setPatients(res.data.patients || []);
    } catch {
      console.error("Failed to load patients");
    }
  };

  // Add a new test result field
  const addTestResult = () => {
    setFormData({
      ...formData,
      test_results: [
        ...formData.test_results,
        { test_name: "", result: "", normal_range: "", units: "", remarks: "" },
      ],
    });
  };

  // Update a test result field
  const updateTestResult = (index, field, value) => {
    const updated = [...formData.test_results];
    updated[index][field] = value;
    setFormData({ ...formData, test_results: updated });
  };

  // Remove a test result
  const removeTestResult = (index) => {
    const updated = formData.test_results.filter((_, i) => i !== index);
    setFormData({ ...formData, test_results: updated });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Select a patient");
    if (formData.test_results.length === 0)
      return alert("Add at least one test result");
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/labtests/create/${selectedPatient}`,
        formData,
        axiosConfig
      );
      setMessage("Lab Test Created Successfully!");
      setFormData({ diagnosis: "", remarks: "", test_results: [] });
      setSelectedPatient("");
      fetchLabTests();
    } catch {
      setError("Failed to create lab test");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white border-2 border-black p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
            <FlaskConical className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-black">Manage Lab Tests</h2>
          <p className="text-gray-600 mt-1">Create and view lab test records</p>
        </div>

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

        {/* Create Lab Test Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="border-2 border-gray-300 p-2 rounded-lg w-full md:w-1/4"
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name || "Unnamed"} ({p.userId?.email || "No Email"}
                  )
                </option>
              ))}
            </select>
            <input
              type="text"
              name="diagnosis"
              placeholder="Diagnosis"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              className="border-2 border-gray-300 p-2 rounded-lg w-full md:w-1/3"
              required
            />
            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="border-2 border-gray-300 p-2 rounded-lg w-full md:w-1/3"
            />
          </div>

          {/* Dynamic Test Results Section */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Test Results</h3>

            {formData.test_results.map((tr, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Test Name"
                  value={tr.test_name}
                  onChange={(e) =>
                    updateTestResult(i, "test_name", e.target.value)
                  }
                  className="border-2 border-gray-300 p-2 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Result"
                  value={tr.result}
                  onChange={(e) =>
                    updateTestResult(i, "result", e.target.value)
                  }
                  className="border-2 border-gray-300 p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Normal Range"
                  value={tr.normal_range}
                  onChange={(e) =>
                    updateTestResult(i, "normal_range", e.target.value)
                  }
                  className="border-2 border-gray-300 p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Units"
                  value={tr.units}
                  onChange={(e) => updateTestResult(i, "units", e.target.value)}
                  className="border-2 border-gray-300 p-2 rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={tr.remarks}
                    onChange={(e) =>
                      updateTestResult(i, "remarks", e.target.value)
                    }
                    className="border-2 border-gray-300 p-2 rounded-lg w-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeTestResult(i)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addTestResult}
              className="mt-2 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-black flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Test Result
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800"
          >
            <PlusCircle className="w-5 h-5" />
            {loading ? "Creating..." : "Add Test"}
          </button>
        </form>

        {/* Existing Lab Tests */}
        <div className="space-y-4">
          {labTests.map((t) => (
            <div
              key={t._id}
              className="border-2 border-gray-300 p-4 rounded-lg flex flex-col md:flex-row justify-between"
            >
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient:{" "}
                  {t.patientId?.userId?.name || "Unknown"}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-4 h-4" /> Diagnosis: {t.diagnosis}
                </p>
                <p className="text-gray-600">
                  Status: <strong>{t.status}</strong>
                </p>
              </div>
              {t.file_url && (
                <a
                  href={t.file_url}
                  target="_blank"
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
  );
};

export default CreateLabTest;
