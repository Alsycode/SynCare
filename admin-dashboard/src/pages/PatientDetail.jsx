import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaNotesMedical,
  FaHeartbeat,
  FaClipboardList,
  FaStethoscope,
  FaPills,
  FaThermometerHalf,
  FaTint,

} from "react-icons/fa";

const PatientDetail = () => {
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
      } catch (err) {
        setError(err.message || "Failed to load patient details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [patientId]);

  // Group entries by date and addedBy
 const groupEntries = (entries) => {
  const grouped = {};
  entries.forEach((entry) => {
    const dateKey = new Date(entry.date).toISOString().split(".")[0];
    const key = `${dateKey}_${entry.addedBy?._id || entry.addedBy}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: entry.date,
        addedBy: entry.addedBy,
        appointmentId: entry.appointmentId, // keep appointment ref
        diagnosis: [],
        treatment: [],
        progress: [],
        note: [],
        vitals: [],
        instruction: [], // ✅ new type
      };
    }

    // if entry.type doesn’t exist in grouped, initialize it
    if (!grouped[key][entry.type]) {
      grouped[key][entry.type] = [];
    }
    grouped[key][entry.type].push(entry);
  });
  return Object.values(grouped);
};


  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-primary ${
          theme === "dark" ? "text-white" : "text-primary"
        }`}
      >
        <p className="text-secondary">Loading patient details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-primary ${
          theme === "dark" ? "text-white" : "text-primary"
        }`}
      >
        <div className="p-6 rounded-xl bg-status-red text-white text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!patient || !medicalHistory) return null;

  const groupedEntries = medicalHistory.entries
    ? groupEntries(medicalHistory.entries)
    : [];

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-6xl rounded-[50px] p-6 sm:p-10 shadow-card bg-card border border-primary">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Patient Details –{" "}
          <span className="text-accent">{patient.name}</span>
        </h2>

        {/* Patient Info */}
        <div className="p-6 rounded-xl bg-card border border-primary shadow-card mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className="flex items-center gap-2">
              <FaUser className="text-accent" />
              <span className="font-semibold">Name:</span> {patient.name || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-accent" />
              <span className="font-semibold">Email:</span> {patient.email || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-accent" />
              <span className="font-semibold">Phone:</span> {patient.phone || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <FaCalendarAlt className="text-accent" />
              <span className="font-semibold">Registered:</span>{" "}
              {patient.createdAt
                ? new Date(patient.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Medical History */}
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">
          Medical History
        </h3>
        {groupedEntries.length === 0 ? (
          <p className="text-secondary text-center">
            No medical history available.
          </p>
        ) : (
          <div className="space-y-6">
            {groupedEntries.map((group, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-card border border-primary shadow-card hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex flex-col gap-2 mb-4">
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-accent" />
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(group.date).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaUser className="text-accent" />
                    <span className="font-semibold">Added By:</span>{" "}
                    {group.addedBy?.name || group.addedBy.toString() || "N/A"}
                  </p>
                </div>

                <div className="space-y-3">
                  {group.diagnosis.length > 0 && (
                    <Section
                      icon={<FaNotesMedical className="text-accent" />}
                      title="Diagnosis"
                      items={group.diagnosis}
                    />
                  )}
                  {group.treatment.length > 0 && (
                    <Section
                      icon={<FaPills className="text-accent" />}
                      title="Treatment"
                      items={group.treatment}
                    />
                  )}
                  {group.progress.length > 0 && (
                    <Section
                      icon={<FaClipboardList className="text-accent" />}
                      title="Progress"
                      items={group.progress}
                    />
                  )}
                  {group.note.length > 0 && (
                    <Section
                      icon={<FaStethoscope className="text-accent" />}
                      title="Notes"
                      items={group.note}
                    />
                  )}
                {group.vitals.length > 0 && (
  <div className="space-y-2">
    <span className="font-semibold flex items-center gap-2">
      <FaHeartbeat className="text-accent" /> Vitals:
    </span>
    <ul className="ml-6 text-secondary space-y-2">
      {group.vitals.map((entry) => {
        try {
          const vitals = JSON.parse(entry.details);
          return (
            <li key={entry._id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FaTint className="text-accent" />
                <span>BP: {vitals.bloodPressure || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaHeartbeat className="text-accent" />
                <span>HR: {vitals.heartRate || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaThermometerHalf className="text-accent" />
                <span>Temp: {vitals.temperature || "N/A"}</span>
              </div>
            </li>
          );
        } catch {
          return <li key={entry._id}>{entry.details}</li>;
        }
      })}
    </ul>
  </div>
)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable section for diagnosis/treatment/etc
const Section = ({ icon, title, items }) => (
  <div className="flex items-start gap-2">
    {icon}
    <div>
      <span className="font-semibold">{title}:</span>
      <ul className="list-disc list-inside ml-2 text-secondary">
        {items.map((entry) => (
          <li key={entry._id}>{entry.details}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default PatientDetail;
