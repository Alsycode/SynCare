import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: true, withCredentials: true });

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctorNotes: "",
    diagnosis: "",
    treatmentPlan: "",
    vitalSigns: { bloodPressure: "", heartRate: "", temperature: "" },
    progressStatus: "unknown",
  });
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const appts = await fetchData("/api/appointments/doctor");
        setAppointments(appts);
        const userId = localStorage.getItem("userId");
        const unread = await fetchData(`/api/chat/unread-counts/${userId}`);
        setUnreadCounts(unread);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();

    socket.on("appointmentUpdated", (updatedAppointment) => {
      setAppointments((prev) =>
        prev.map((a) => (a._id === updatedAppointment._id ? updatedAppointment : a))
      );
    });

    socket.on("unreadCountsUpdated", (newUnreadCounts) => {
      setUnreadCounts(newUnreadCounts);
    });

    return () => {
      socket.off("appointmentUpdated");
      socket.off("unreadCountsUpdated");
    };
  }, []);

  const handleConfirm = async (id) => {
    try {
      await fetchData(`/api/appointments/confirm/${id}`, {
        method: "PUT",
        data: {},
      });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "confirmed" } : a))
      );
      socket.emit("appointmentConfirmed", { appointmentId: id });
    } catch {
      setError("Failed to confirm appointment");
    }
  };

  const handleComplete = async (id) => {
    try {
      await fetchData(`/api/appointments/complete/${id}`, {
        method: "PUT",
        data: formData,
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: "completed", ...formData } : a
        )
      );
      setSelectedAppointment(null);
      setFormData({
        doctorNotes: "",
        diagnosis: "",
        treatmentPlan: "",
        vitalSigns: { bloodPressure: "", heartRate: "", temperature: "" },
        progressStatus: "unknown",
      });
      socket.emit("appointmentCompleted", { appointmentId: id });
    } catch {
      setError("Failed to complete appointment");
    }
  };

  const openCompleteForm = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      doctorNotes: appointment.doctorNotes || "",
      diagnosis: appointment.diagnosis || "",
      treatmentPlan: appointment.treatmentPlan || "",
      vitalSigns: appointment.vitalSigns || {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
      },
      progressStatus: appointment.progressStatus || "unknown",
    });
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-7xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Doctor Dashboard
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">
            {error}
          </div>
        )}

        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Your Appointments
        </h3>

        {isLoading ? (
          <div className="flex flex-col gap-2 sm:gap-3">
            {Array(3)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-5 rounded-xl bg-card border border-primary shadow-card animate-pulse"
                >
                  <div className="mb-1 h-4 bg-secondary rounded w-3/4"></div>
                  <div className="mb-1 h-4 bg-secondary rounded w-1/2"></div>
                  <div className="mb-1 h-4 bg-secondary rounded w-3/4"></div>
                  <div className="mb-4 h-4 bg-secondary rounded w-1/2"></div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="h-10 bg-secondary rounded-lg w-24"></div>
                    <div className="h-10 bg-secondary rounded-lg w-24"></div>
                    <div className="h-10 bg-secondary rounded-lg w-32"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-secondary">No appointments found</p>
        ) : (
          <div className="flex flex-col gap-2 sm:gap-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="p-3 sm:p-5 rounded-xl bg-card border border-primary shadow-card hover:scale-[1.02] transition-all duration-300 text-primary"
              >
                <p className="mb-1">
                  <span className="font-semibold text-accent">Date:</span>{" "}
                  {new Date(appt.date).toLocaleDateString()}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-accent">Time:</span> {appt.time}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-accent">Patient:</span>{" "}
                  {appt.patientId?.name || "N/A"}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-accent">Patient ID:</span>{" "}
                  {appt.patientId?._id || "N/A"}
                </p>
                <p className="mb-4">
                  <span className="font-semibold text-accent">Status:</span>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold bg-opacity-70 ${
                      appt.status === "confirmed"
                        ? "bg-status-green"
                        : appt.status === "completed"
                        ? "bg-status-blue"
                        : "bg-status-yellow"
                    } text-white`}
                  >
                    {appt.status}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {appt.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(appt._id)}
                      className="bg-status-green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status === "confirmed" && (
                    <button
                      onClick={() => openCompleteForm(appt)}
                      className="bg-status-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                    >
                      Complete
                    </button>
                  )}
                  <Link
                    to={`/video-call/${appt._id}`}
                    className="inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Video Call
                  </Link>
                  <Link
                    to={`/doctor-dashboard/chat/${appt.patientId?._id}`}
                    className="inline-block bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Chat with Patient{" "}
                    {unreadCounts[appt.patientId?._id] ? (
                      <span className="ml-2 bg-status-red text-white rounded-full px-2 py-1 text-xs">
                        {unreadCounts[appt.patientId?._id]}
                      </span>
                    ) : null}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-primary text-primary w-full max-w-sm sm:max-w-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Complete Appointment
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComplete(selectedAppointment._id);
                }}
              >
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Doctor Notes</label>
                  <textarea
                    value={formData.doctorNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorNotes: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                    placeholder="Enter notes..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Diagnosis</label>
                  <input
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                    placeholder="Enter diagnosis..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Treatment Plan</label>
                  <textarea
                    value={formData.treatmentPlan}
                    onChange={(e) =>
                      setFormData({ ...formData, treatmentPlan: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                    placeholder="Enter treatment plan..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Vital Signs</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <input
                      value={formData.vitalSigns.bloodPressure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitalSigns: {
                            ...formData.vitalSigns,
                            bloodPressure: e.target.value,
                          },
                        })
                      }
                      className="p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                      placeholder="BP (e.g., 120/80)"
                    />
                    <input
                      value={formData.vitalSigns.heartRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitalSigns: {
                            ...formData.vitalSigns,
                            heartRate: e.target.value,
                          },
                        })
                      }
                      className="p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                      placeholder="Heart Rate"
                    />
                    <input
                      value={formData.vitalSigns.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitalSigns: {
                            ...formData.vitalSigns,
                            temperature: e.target.value,
                          },
                        })
                      }
                      className="p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                      placeholder="Temperature"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Progress Status</label>
                  <select
                    value={formData.progressStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, progressStatus: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="improving">Improving</option>
                    <option value="stable">Stable</option>
                    <option value="worsening">Worsening</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-status-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="text-primary mt-4">
          {isLoading ? (
            <p className="text-secondary">Loading unread counts...</p>
          ) : unreadCounts && Object.keys(unreadCounts).length > 0 ? (
            <p>Unread messages: {JSON.stringify(unreadCounts)}</p>
          ) : (
            <p className="text-secondary">No unread messages</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
