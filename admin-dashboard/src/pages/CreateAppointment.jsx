import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

function CreateAppointment() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme } = useContext(ThemeContext);

  // Fetch patients and doctors list
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

  // Fetch available slots whenever doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.date) {
        setAvailableSlots([]);
        return;
      }
      try {
        const res = await fetchData(
          `/api/appointments/available?doctorId=${formData.doctorId}&date=${formData.date}`
        );
        setAvailableSlots(res.availableSlots || []);
        setFormData((prev) => ({ ...prev, time: "" })); // reset time on doctor/date change
      } catch (err) {
        setError(err.message || "Failed to fetch available slots");
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [formData.doctorId, formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchData("/api/appointments", {
        method: "POST",
        data: formData,
      });
      setSuccess("Appointment created successfully");
      setError("");
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Patient */}
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

          {/* Doctor */}
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

          {/* Date */}
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

          {/* Time */}
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
}

export default CreateAppointment;
