import React, { useState, useEffect } from "react";
import axios from "axios";

const PatientSearch = () => {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("disease_details");

  const filters = ["disease_details", "age", "gender"];

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(
          "http://localhost:7777/api/patients/getAllPatients"
        );
        setPatients(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  // Filter as user types
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFiltered(
      patients.filter((p) => {
        if (filterBy === "disease_details") {
          return (p.disease_details || "").toLowerCase().includes(lowerSearch);
        } else if (filterBy === "age") {
          return p.age?.toString().includes(lowerSearch);
        } else if (filterBy === "gender") {
          return (p.gender || "").toLowerCase().includes(lowerSearch);
        }
        return false;
      })
    );
  }, [search, patients, filterBy]);

  return (
    <div className="p-4 max-w-lg mx-auto border rounded">
      <div className="flex gap-2 mb-2">
        {filters.map((f) => (
          <button
            key={f}
            className={`px-3 py-1 rounded ${
              filterBy === f ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilterBy(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder={`Search patients by ${filterBy}...`}
        className="border p-2 w-full rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filtered.length ? (
          filtered.map((p) => (
            <li key={p._id} className="border-b py-2">
              <strong>{p.userId?.name}</strong> — {p.disease_details} — {p.age}{" "}
              yrs — {p.gender}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No results found</p>
        )}
      </ul>
    </div>
  );
};

export default PatientSearch;
