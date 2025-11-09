import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardPlus, CheckCircle, AlertCircle } from "lucide-react";
import PrescriptionForm from "./PrescriptionForm.jsx";
import PatientSelection from "./PatientSelection.jsx";

const CreatePrescription = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/patients/getall-patients`,
        axiosConfig
      );
      console.log(res)
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-6xl bg-white border-2 border-black p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center w-16 h-16 bg-black text-white rounded-full mx-auto mb-4">
            <ClipboardPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-black">Create Prescription</h2>
          <p className="text-gray-600 mt-1">
            Select a patient and generate a prescription
          </p>
        </div>

        {/* Alerts */}
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

        {/* Conditional Rendering */}
        {!selectedPatient ? (
          <PatientSelection patients={patients} onSelect={setSelectedPatient} />
        ) : (
          <PrescriptionForm
            selectedPatient={selectedPatient}
            onCancel={() => setSelectedPatient(null)}
            onSuccess={setMessage}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePrescription;
