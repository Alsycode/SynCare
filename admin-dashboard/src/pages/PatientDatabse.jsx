import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

const PatientListAdmin = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of patients per page

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const data = await fetchData("/api/patients/list");
        setPatients(data);
        setFilteredPatients(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch patients");
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredPatients(patients);
    } else {
      const lower = search.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(lower)) ||
            (p._id && p._id.toLowerCase().includes(lower)) ||
            (p.email && p.email.toLowerCase().includes(lower)) ||
            (p.phone && p.phone.toLowerCase().includes(lower))
        )
      );
    }
  }, [search, patients]);

  // Reset page to 1 when filtered patients change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPatients]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  // Slice patients for current page
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
console.log("paginatedPatients",paginatedPatients)
  const handleSelectPatient = (id) => {
    navigate(`/patient/${id}`);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const SkeletonRow = () => (
    <tr className="hover:bg-secondary transition-colors">
      {Array(5)
        .fill()
        .map((_, index) => (
          <td key={index} className="py-2 px-3 border-b border-primary">
            <div className="animate-pulse bg-secondary h-4 w-3/4 rounded" />
          </td>
        ))}
    </tr>
  );

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-7xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">
              Patient List <span className="text-accent">Admin</span>
            </h2>
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search by name, ID, email, or phone"
                className="w-full p-3 rounded-xl border border-primary bg-card text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          {error && (
            <p className="text-status-red text-center text-sm md:text-base">
              {error}
            </p>
          )}
          <div className="overflow-x-auto rounded-2xl bg-card border border-primary shadow-card">
            <table className="min-w-full text-primary text-sm md:text-base">
              <thead>
                <tr className="bg-secondary">
                  <th className="py-2 px-3 text-center">Name</th>
                  <th className="py-2 px-3 text-center">ID</th>
                  <th className="py-2 px-3 text-center">Email</th>
                  <th className="py-2 px-3 text-center">Phone</th>
                  {/* <th className="py-2 px-3 text-center">Medical History</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5)
                    .fill()
                    .map((_, index) => <SkeletonRow key={index} />)
                ) : paginatedPatients.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-3 px-4 text-center text-secondary"
                    >
                      No patients found
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => (
                    <tr
                      key={patient._id}
                      className="hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => handleSelectPatient(patient._id)}
                    >
                      <td className="py-2 px-3 border-b border-primary flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {patient.name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        {patient._id}
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        {patient.email || "N/A"}
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        {patient.phone || "N/A"}
                      </td>
                      {/* <td className="py-2 px-3 border-b border-primary">
                        {patient.profile?.medicalHistory
                          ? patient.profile.medicalHistory.slice(0, 30) +
                            (patient.profile.medicalHistory.length > 30
                              ? "..."
                              : "")
                          : "No history"}
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientListAdmin;
