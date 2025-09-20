import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

/**
 * CreateAppointment
 * -----------------
 * This component renders a form to create new patient appointments.
 * It fetches the lists of patients and doctors, fetches available appointment slots
 * when doctor/date changes, and submits a new appointment on form submit.
 */
const CreateAppointment = () => {
  // State for patients and doctors dropdowns
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // State for available time slots for a doctor on a specific date
  const [availableSlots, setAvailableSlots] = useState([]);

  // State for the appointment form
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
  });

  // Status message states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get current theme (light/dark) from context for adaptive styling
  const { theme } = useContext(ThemeContext);

  /**
   * useEffect to fetch list of patients and doctors
   * Runs once on mount.
   */
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const patientData = await fetchData("/api/patients/list");
        const doctorData = await fetchData("/api/doctors/list");
        setPatients(patientData);
        setDoctors(doctorData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      }
    };
    fetchLists();
  }, []);

  /**
   * useEffect to fetch available time slots
   * Runs every time doctorId or date changes in formData.
   * Resets slot/time selection if doctor or date is cleared/changed.
   */
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.date) {
        setAvailableSlots([]);
        return;
      }
      try {
        // Fetch available slots for the selected doctor/date
        const res = await fetchData(
          `/api/appointments/available?doctorId=${formData.doctorId}&date=${formData.date}`
        );
        setAvailableSlots(res.availableSlots || []);
        setFormData((prev) => ({ ...prev, time: "" })); // reset selected time slot
      } catch (err) {
        setError(err.message || "Failed to fetch available slots");
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [formData.doctorId, formData.date]);

  /**
   * Handles form submission.
   * Posts form data to create a new appointment and shows result.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchData("/api/appointments", {
        method: "POST",
        data: formData,
      });
      setSuccess("Appointment created successfully");
      setError("");
      // Reset form and time slots on success
      setFormData({ patientId: "", doctorId: "", date: "", time: "" });
      setAvailableSlots([]);
    } catch (err) {
      setError(err.message || "Failed to create appointment");
      setSuccess("");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-md sm:max-w-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Create Appointment
        </h2>

        {/* Show error/success messages */}
        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-status-green text-white text-center">
            {success}
          </div>
        )}

        {/* Appointment creation form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Patient selection dropdown */}
          <div className="mb-2">
            <label className="block mb-1 text-left">Patient</label>
            <select
              value={formData.patientId}
              onChange={(e) =>
                setFormData({ ...formData, patientId: e.target.value })
              }
              className="w-full p-3 rounded bg-secondary border border-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor selection dropdown */}
          <div className="mb-2">
            <label className="block mb-1 text-left">Doctor</label>
            <select
              value={formData.doctorId}
              onChange={(e) =>
                setFormData({ ...formData, doctorId: e.target.value })
              }
              className="w-full p-3 rounded bg-secondary border border-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} ({doctor.profile.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Date input */}
          <div className="mb-2">
            <label className="block mb-1 text-left">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full p-3 rounded bg-secondary border border-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Time slot selection */}
          <div className="mb-4">
            <label className="block mb-1 text-left">Time</label>
            <select
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full p-3 rounded bg-secondary border border-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
              disabled={!availableSlots.length}
            >
              <option value="">
                {availableSlots.length
                  ? "Select Time Slot"
                  : "No slots available"}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-accent text-white p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
          >
            Create Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointment;
