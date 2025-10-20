import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("name"); // default filter is name

  const filters = ["name", "specialization", "rating", "experience_years"];

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          "http://localhost:7777/api/admin/getAllDoctors"
        );
        setDoctors(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  // Filter as user types
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFiltered(
      doctors.filter((d) => {
        if (filterBy === "name") {
          return (d.userId?.name || "").toLowerCase().includes(lowerSearch);
        } else if (filterBy === "specialization") {
          return (d.specialization || "").toLowerCase().includes(lowerSearch);
        } else if (filterBy === "rating") {
          return d.rating?.toString().includes(lowerSearch);
        } else if (filterBy === "experience_years") {
          return d.experience_years?.toString().includes(lowerSearch);
        }
        return false;
      })
    );
  }, [search, doctors, filterBy]);

  return (
    <div className="p-4 max-w-lg mx-auto border rounded">
      <div className="flex gap-2 mb-2">
        {filters.map((f) => (
          <button
            key={f}
            className={`px-3 py-1 rounded ${
              filterBy === f ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilterBy(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder={`Search doctors by ${filterBy}...`}
        className="border p-2 w-full rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filtered.length ? (
          filtered.map((d) => (
            <li key={d._id} className="border-b py-2">
              <strong>{d.userId?.name}</strong> — {d.specialization} —{" "}
              {d.experience_years} yrs — Rating: {d.rating}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No results found</p>
        )}
      </ul>
    </div>
  );
};

export default DoctorSearch;
