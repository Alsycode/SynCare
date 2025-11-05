import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";
import { io } from "socket.io-client";
import { FaCalendarAlt, FaClock, FaUser, FaNotesMedical } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

// Initialize the Socket.io client once with static URL and configuration
const socket = io("https://syncare.onrender.com/", { autoConnect: true, withCredentials: true });

/**
 * DoctorDashboard
 * ----------------
 * Dashboard for doctors to manage their appointments, view unread messages,
 * update appointment status, complete appointments with notes/vitals, and enter instructions.
 * Real-time updates are handled via Socket.io for both appointments and unread message counts.
 */
const DoctorDashboard = () => {
  // Appointments list shown to the doctor (pulled from API and enriched with instructions)
  const [appointments, setAppointments] = useState([]);
  // Unread chat message counts related to each patient (for notification badges)
  const [unreadCounts, setUnreadCounts] = useState({});
  // Status and form UI controls
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Controls for "complete appointment" modal and its form state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctorNotes: "",
    diagnosis: "",
    treatmentPlan: "",
    vitalSigns: { bloodPressure: "", heartRate: "", temperature: "" },
    progressStatus: "unknown",
    instructions: "",
    isOngoing: false,
  });

  // Contextual theming for light/dark UI
  const { theme } = useContext(ThemeContext);

  /**
   * Load appointments and unread chat counts at mount. For each appointment,
   * also fetch any patient instructions associated with it.
   * Set up socket listeners for real-time updates of appointments and unread messages.
   */
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const appts = await fetchData("/api/appointments/doctor");
        const userId = localStorage.getItem("userId");
        const unread = await fetchData(`/api/chat/unread-counts/${userId}`);

        // Attach instructions (if any) per appointment
        const appointmentsWithInstructions = await Promise.all(
          appts.map(async (appt) => {
            const instructions = await fetchData(`/api/instructions/appointment/${appt._id}`);
            return { ...appt, instructions: instructions || [] };
          })
        );

        setAppointments(appointmentsWithInstructions);
        setUnreadCounts(unread);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();

    // Set up socket listeners for appointment and unreadCount changes in real-time
    socket.on("appointmentUpdated", (updatedAppointment) => {
      setAppointments((prev) =>
        prev.map((a) => (a._id === updatedAppointment._id ? updatedAppointment : a))
      );
    });

    socket.on("unreadCountsUpdated", (newUnreadCounts) => {
      setUnreadCounts(newUnreadCounts);
    });

    // Best practice: remove all listeners on unmount to avoid memory leaks
    return () => {
      socket.off("appointmentUpdated");
      socket.off("unreadCountsUpdated");
    };
  }, []);

  /**
   * Confirm an appointment as the doctor. Emit socket event after local update.
   * @param {string} id Appointment ID
   */
  const handleConfirm = async (id) => {
    try {
      await fetchData(`/api/appointments/confirm/${id}`, { method: "PUT", data: {} });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "confirmed" } : a))
      );
      socket.emit("appointmentConfirmed", { appointmentId: id });
    } catch {
      setError("Failed to confirm appointment");
    }
  };

  /**
   * Complete an appointment as the doctor. Submit all fields, clear the modal, emit socket event.
   * @param {string} id Appointment ID
   */
  const handleComplete = async (id) => {
    try {
      await fetchData(`/api/appointments/complete/${id}`, {
        method: "PUT",
        data: {
          doctorNotes: formData.doctorNotes,
          diagnosis: formData.diagnosis,
          treatmentPlan: formData.treatmentPlan,
          vitalSigns: formData.vitalSigns,
          progressStatus: formData.progressStatus,
          instructions: formData.instructions,
          isOngoing: formData.isOngoing,
        },
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === id
            ? { ...a, status: "completed", ...formData, instructions: [{ text: formData.instructions, isOngoing: formData.isOngoing }] }
            : a
        )
      );
      setSelectedAppointment(null);
      setFormData({
        doctorNotes: "",
        diagnosis: "",
        treatmentPlan: "",
        vitalSigns: { bloodPressure: "", heartRate: "", temperature: "" },
        progressStatus: "unknown",
        instructions: "",
        isOngoing: false,
      });
      socket.emit("appointmentCompleted", { appointmentId: id });
    } catch (err) {
      setError("Failed to complete appointment");
    }
  };

  /**
   * Open the form/modal for marking an appointment "completed" (prefill any existing fields).
   */
  const openCompleteForm = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      doctorNotes: appointment.doctorNotes || "",
      diagnosis: appointment.diagnosis || "",
      treatmentPlan: appointment.treatmentPlan || "",
      vitalSigns: appointment.vitalSigns || { bloodPressure: "", heartRate: "", temperature: "" },
      progressStatus: appointment.progressStatus || "unknown",
      instructions: appointment.instructions.length > 0 ? appointment.instructions[0].text : "",
      isOngoing: appointment.instructions.length > 0 ? appointment.instructions[0].isOngoing : false,
    });
  };

  // ------------------------ Render Section ------------------------

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-7xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
        {/* Page Title */}
        {/* <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Doctor Dashboard
        </h2> */}

        {/* Error message banner */}
        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">
            {error}
          </div>
        )}

        {/* Appointments List */}
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Your Appointments
        </h3>

        {/* Appointments Loading Skeletons */}
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
            {/* Card for each appointment */}
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="p-5 rounded-xl bg-card border border-primary shadow-card hover:scale-[1.02] transition-all duration-300 text-primary"
              >
                <div className="flex justify-between items-start mb-4">
                  {/* Patient Name */}
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <FaUser className="text-accent" />
                    {appt.patientId?.name || "N/A"}
                  </h4>
                  {/* Appointment Status */}
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
                </div>

                {/* Quick Info: date, time, instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-accent" />
                    {new Date(appt.date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock className="text-accent" />
                    {appt.time}
                  </p>
                  <p className="flex items-center gap-2 col-span-1 sm:col-span-2">
                    <FaNotesMedical className="text-accent" />
                    {appt.instructions.length > 0
                      ? appt.instructions[0].text
                      : "No instructions"}
                    {appt.instructions.length > 0 && appt.instructions[0].isOngoing && (
                      <span className="ml-2 text-status-yellow font-semibold">(Ongoing)</span>
                    )}
                  </p>
                </div>

                {/* Main Appointment Actions */}
                <div className="flex flex-wrap gap-3">
                  {/* Confirm Button (if still pending) */}
                  {appt.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(appt._id)}
                      className="bg-status-green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                    >
                      Confirm
                    </button>
                  )}
                  {/* Complete Button (if confirmed) */}
                  {appt.status === "confirmed" && (
                    <button
                      onClick={() => openCompleteForm(appt)}
                      className="bg-status-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                    >
                      Complete
                    </button>
                  )}
                  {/* Video Call Link */}
                  <Link
                    to={`/video-call/${appt._id}`}
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    <MdOutlineAssignment />
                    Video Call
                  </Link>
                  {/* Patient Chat Link, shows unread badge if present */}
                  <Link
                    to={`/doctor-dashboard/chat/${appt.patientId?._id}`}
                    className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Chat with Patient
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

        {/* Modal: Complete Appointment Form */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-primary text-primary max-h-[90vh] w-full max-w-md sm:max-w-lg overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Complete Appointment
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComplete(selectedAppointment._id);
                }}
                className="space-y-4"
              >
                {/* Doctor notes */}
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Doctor Notes</label>
                  <textarea
                    value={formData.doctorNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorNotes: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent h-24 resize-y"
                    placeholder="Enter notes..."
                  />
                </div>
                {/* Diagnosis */}
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
                {/* Treatment Plan */}
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Treatment Plan</label>
                  <textarea
                    value={formData.treatmentPlan}
                    onChange={(e) =>
                      setFormData({ ...formData, treatmentPlan: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent h-24 resize-y"
                    placeholder="Enter treatment plan..."
                  />
                </div>
                {/* Vitals */}
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Vital Signs</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <input
                      value={formData.vitalSigns.bloodPressure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value },
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
                          vitalSigns: { ...formData.vitalSigns, heartRate: e.target.value },
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
                          vitalSigns: { ...formData.vitalSigns, temperature: e.target.value },
                        })
                      }
                      className="p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                      placeholder="Temperature"
                    />
                  </div>
                </div>
                {/* Progress status */}
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
                {/* Instructions */}
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Instructions for Patient</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent h-24 resize-y"
                    placeholder="e.g., Take 500mg Amoxicillin twice daily, Return in 1 week..."
                  />
                </div>
                {/* Ongoing instruction */}
                <div className="mb-4">
                  <label className="block mb-1 text-primary">Ongoing Instruction?</label>
                  <input
                    type="checkbox"
                    checked={formData.isOngoing}
                    onChange={(e) =>
                      setFormData({ ...formData, isOngoing: e.target.checked })
                    }
                    className="mr-2 leading-tight"
                  />
                  <span>Mark as ongoing (carries forward to future appointments)</span>
                </div>
                {/* Actions */}
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

        {/* Unread messages badge/display (dev status/debug) */}
        {/* <div className="text-primary mt-4">
          {isLoading ? (
            <p className="text-secondary">Loading unread counts...</p>
          ) : unreadCounts && Object.keys(unreadCounts).length > 0 ? (
            <p>Unread messages: {JSON.stringify(unreadCounts)}</p>
          ) : (
            <p className="text-secondary">No unread messages</p>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default DoctorDashboard;
