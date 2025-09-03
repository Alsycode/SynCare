import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

function PatientDetail() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const patientData = await fetchData(`/api/patients/${patientId}`);
        setPatient(patientData);
        const historyData = await fetchData(`/api/medicalHistory/${patientId}`);
        setMedicalHistory(historyData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load patient details");
        setLoading(false);
      }
    };
    fetchDetails();
  }, [patientId]);

  // Group entries by date (ignoring milliseconds) and addedBy
  const groupEntries = (entries) => {
    const grouped = {};
    entries.forEach((entry) => {
      const dateKey = new Date(entry.date).toISOString().split('.')[0]; // Ignore milliseconds
      const key = `${dateKey}_${entry.addedBy}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: entry.date,
          addedBy: entry.addedBy,
          diagnosis: [],
          treatment: [],
          progress: [],
          note: [],
          vitals: [],
        };
      }
      grouped[key][entry.type].push(entry);
    });
    return Object.values(grouped);
  };

  const SkeletonCard = () => (
    <div className="animate-pulse space-y-4">
      <div className="bg-secondary h-8 w-1/3 rounded"></div>
      <div className="space-y-2">
        {Array(3)
          .fill()
          .map((_, index) => (
            <div key={index} className="bg-secondary h-4 w-3/4 rounded"></div>
          ))}
      </div>
      <div className="bg-secondary h-6 w-1/4 rounded"></div>
      <div className="space-y-3">
        {Array(2)
          .fill()
          .map((_, index) => (
            <div
              key={index}
              className="bg-secondary h-24 w-full rounded-xl"
            ></div>
          ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-primary ${
          theme === "dark" ? "text-white" : "text-primary"
        }`}
      >
        <div className="card w-full max-w-4xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-primary ${
          theme === "dark" ? "text-white" : "text-primary"
        }`}
      >
        <div className="card w-full max-w-4xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
          <p className="text-status-red text-center text-sm md:text-base">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!patient || !medicalHistory) return null;

  const groupedEntries = medicalHistory.entries ? groupEntries(medicalHistory.entries) : [];

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-4xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Patient Details <span className="text-accent">{patient.name}</span>
          </h2>
          <div className="card rounded-xl p-5 backdrop-blur-lg border border-primary shadow-card hover:scale-105 transition-transform">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
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
                <p>
                  <span className="font-semibold">Name:</span> {patient.name || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p>
                  <span className="font-semibold">Email:</span> {patient.email || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <p>
                  <span className="font-semibold">Phone:</span> {patient.phone || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>
                  <span className="font-semibold">Registered:</span>{" "}
                  {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold">
            Medical History
          </h3>
          {groupedEntries.length === 0 ? (
            <p className="text-secondary text-center">
              No medical history available.
            </p>
          ) : (
            <div className="space-y-4">
              {groupedEntries.map((group, index) => (
                <div
                  key={index}
                  className="card rounded-xl p-4 backdrop-blur-lg border border-primary shadow-card hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {new Date(group.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p>
                        <span className="font-semibold">Added By:</span>{" "}
                        {group.addedBy?.name || group.addedBy.toString() || "N/A"}
                      </p>
                    </div>
                    {group.diagnosis.length > 0 && (
                      <div className="flex items-start gap-2">
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <div>
                          <span className="font-semibold">Diagnosis:</span>
                          <ul className="list-disc list-inside ml-2 text-secondary">
                            {group.diagnosis.map((entry) => (
                              <li key={entry._id}>{entry.details}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {group.treatment.length > 0 && (
                      <div className="flex items-start gap-2">
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
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <span className="font-semibold">Treatment:</span>
                          <ul className="list-disc list-inside ml-2 text-secondary">
                            {group.treatment.map((entry) => (
                              <li key={entry._id}>{entry.details}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {group.progress.length > 0 && (
                      <div className="flex items-start gap-2">
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
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        <div>
                          <span className="font-semibold">Progress:</span>
                          <ul className="list-disc list-inside ml-2 text-secondary">
                            {group.progress.map((entry) => (
                              <li key={entry._id}>{entry.details}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {group.note.length > 0 && (
                      <div className="flex items-start gap-2">
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-3 0a2 2 0 012 2h2a2 2 0 012-2m-6 0a2 2 0 012 2v14m0 0H7m6-7h3m-6 4h3"
                          />
                        </svg>
                        <div>
                          <span className="font-semibold">Notes:</span>
                          <ul className="list-disc list-inside ml-2 text-secondary">
                            {group.note.map((entry) => (
                              <li key={entry._id}>{entry.details}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {group.vitals.length > 0 && (
                      <div className="flex items-start gap-2">
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
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <div>
                          <span className="font-semibold">Vitals:</span>
                          <ul className="list-disc list-inside ml-2 text-secondary">
                            {group.vitals.map((entry) => {
                              try {
                                const vitals = JSON.parse(entry.details);
                                return (
                                  <li key={entry._id}>
                                    Blood Pressure: {vitals.bloodPressure || "N/A"}, 
                                    Heart Rate: {vitals.heartRate || "N/A"}, 
                                    Temperature: {vitals.temperature || "N/A"}
                                  </li>
                                );
                              } catch {
                                return <li key={entry._id}>{entry.details}</li>;
                              }
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDetail;