import React, { useState } from "react";
import { PlusCircle, Trash2, XCircle } from "lucide-react";
import axios from "axios";

const PrescriptionForm = ({ selectedPatient, onCancel, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [precautions, setPrecautions] = useState([""]);
  const [medications, setMedications] = useState([
    {
      medicine_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "Oral",
      instructions: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const axiosConfig = { withCredentials: true };

  // 🧾 Dynamic medication fields
  const addMedication = () =>
    setMedications([
      ...medications,
      {
        medicine_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "Oral",
        instructions: "",
      },
    ]);

  const removeMedication = (i) =>
    setMedications(medications.filter((_, index) => index !== i));

  const updateMedication = (i, field, value) => {
    const updated = [...medications];
    updated[i][field] = value;
    setMedications(updated);
  };

  // 🧾 Dynamic precautions
  const addPrecaution = () => setPrecautions([...precautions, ""]);
  const removePrecaution = (i) =>
    setPrecautions(precautions.filter((_, index) => index !== i));
  const updatePrecaution = (i, value) => {
    const updated = [...precautions];
    updated[i] = value;
    setPrecautions(updated);
  };

  // ✅ Submit Prescription
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${baseUrl}/api/prescriptions/create/${selectedPatient._id}`,
        { diagnosis, medications, precautions },
        axiosConfig
      );
      onSuccess(`✅ Prescription created for ${selectedPatient.userId?.name}`);
      onCancel();
    } catch (err) {
      console.error(err);
      onSuccess("❌ Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-black">
          Prescription for {selectedPatient.userId?.name}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
        >
          <XCircle className="w-4 h-4" /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Diagnosis */}
        <div>
          <label className="block font-semibold mb-2">Diagnosis</label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter diagnosis"
            className="border-2 border-gray-300 p-2 rounded-lg w-full"
            required
          />
        </div>

        {/* Medications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold">Medications</label>
            <button
              type="button"
              onClick={addMedication}
              className="flex items-center text-sm bg-gray-800 text-white px-3 py-1.5 rounded-md hover:bg-black"
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add Medicine
            </button>
          </div>

          {medications.map((m, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3 items-center"
            >
              <input
                type="text"
                placeholder="Medicine Name"
                value={m.medicine_name}
                onChange={(e) =>
                  updateMedication(index, "medicine_name", e.target.value)
                }
                className="border-2 border-gray-300 p-2 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Dosage"
                value={m.dosage}
                onChange={(e) =>
                  updateMedication(index, "dosage", e.target.value)
                }
                className="border-2 border-gray-300 p-2 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Frequency"
                value={m.frequency}
                onChange={(e) =>
                  updateMedication(index, "frequency", e.target.value)
                }
                className="border-2 border-gray-300 p-2 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Duration"
                value={m.duration}
                onChange={(e) =>
                  updateMedication(index, "duration", e.target.value)
                }
                className="border-2 border-gray-300 p-2 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Route"
                value={m.route}
                onChange={(e) =>
                  updateMedication(index, "route", e.target.value)
                }
                className="border-2 border-gray-300 p-2 rounded-lg"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Instructions"
                  value={m.instructions}
                  onChange={(e) =>
                    updateMedication(index, "instructions", e.target.value)
                  }
                  className="border-2 border-gray-300 p-2 rounded-lg w-full"
                />
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Precautions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold">Precautions</label>
            <button
              type="button"
              onClick={addPrecaution}
              className="flex items-center text-sm bg-gray-800 text-white px-3 py-1.5 rounded-md hover:bg-black"
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add Precaution
            </button>
          </div>
          {precautions.map((p, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={p}
                onChange={(e) => updatePrecaution(index, e.target.value)}
                placeholder="Enter precaution"
                className="border-2 border-gray-300 p-2 rounded-lg w-full"
              />
              <button
                type="button"
                onClick={() => removePrecaution(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
          >
            {loading ? "Creating..." : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;
