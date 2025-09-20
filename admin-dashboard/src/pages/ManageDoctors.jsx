import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext"; // Theme context for dark/light mode
import { fetchData } from "../axiosInstance/index"; // Axios helper for API calls

// ManageDoctors component handles adding doctors and updating their schedules
const ManageDoctors = () => {
  // List of doctors fetched from backend
  const [doctors, setDoctors] = useState([]);

  // Form data for adding a new doctor
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });

  // State for schedule update form
  const [scheduleForm, setScheduleForm] = useState({
    doctorId: "", // selected doctor id
    schedule: [{ day: "", startTime: "", endTime: "" }], // multiple schedule slots
  });

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Theme context value (could be used for conditional styling)
  const { theme } = useContext(ThemeContext);

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await fetchData("/api/doctors/list"); // API call to fetch doctors
        setDoctors(data);
      } catch {
        setError("Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, []);

  // Handle adding a new doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await fetchData("/api/doctors/add", {
        method: "POST",
        data: formData,
      });
      setSuccess("Doctor added successfully");
      setError("");
      // Reset form
      setFormData({ name: "", email: "", phone: "", specialty: "" });
      // Refresh doctors list
      const data = await fetchData("/api/doctors/list");
      setDoctors(data);
    } catch {
      setError("Failed to add doctor");
      setSuccess("");
    }
  };

  // Handle updating doctor schedule
  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      await fetchData(`/api/doctors/schedule/${scheduleForm.doctorId}`, {
        method: "PUT",
        data: { schedule: scheduleForm.schedule },
      });
      setSuccess("Schedule updated successfully");
      setError("");
      // Reset schedule input after update
      setScheduleForm({
        ...scheduleForm,
        schedule: [{ day: "", startTime: "", endTime: "" }],
      });
    } catch {
      setError("Failed to update schedule");
      setSuccess("");
    }
  };

  // Add new empty schedule slot (to allow multiple time ranges per doctor)
  const addScheduleSlot = () => {
    setScheduleForm({
      ...scheduleForm,
      schedule: [...scheduleForm.schedule, { day: "", startTime: "", endTime: "" }],
    });
  };

  return (
    // Outer wrapper with styling
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary">
      <div className="card w-full max-w-4xl sm:max-w-5xl p-6 sm:p-8 text-primary">
        {/* Page title */}
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Manage Doctors</h2>

        {/* Show messages */}
        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-status-green text-white">{success}</div>
        )}

        {/* Add Doctor Form */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Add Doctor</h3>
          <form
            onSubmit={handleAddDoctor}
            className="p-4 sm:p-6 rounded-xl card flex flex-col gap-3"
          >
            {/* Dynamically render input fields: name, email, phone, specialty */}
            {["name", "email", "phone", "specialty"].map((field) => (
              <div className="mb-2" key={field}>
                <label className="block mb-1 capitalize text-primary text-left">
                  {field}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                  className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                  placeholder={`Enter ${field}`}
                  required
                />
              </div>
            ))}

            {/* Submit button for adding doctor */}
            <button
              type="submit"
              className="w-full bg-accent text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
            >
              Add Doctor
            </button>
          </form>
        </div>

        {/* Update Doctor Schedule Section */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Update Doctor Schedule</h3>
          <form
            onSubmit={handleUpdateSchedule}
            className="p-4 sm:p-6 rounded-xl card flex flex-col gap-3"
          >
            {/* Dropdown to select a doctor */}
            <div className="mb-2">
              <label className="block mb-1 text-primary text-left">Doctor</label>
              <select
                value={scheduleForm.doctorId}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, doctorId: e.target.value })
                }
                className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
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

            {/* Render schedule slots */}
            {scheduleForm.schedule.map((slot, index) => (
              <div
                key={index}
                className="mb-3 p-3 sm:p-4 rounded bg-secondary border border-primary flex flex-col gap-3"
              >
                <label className="block mb-1 text-primary text-left">
                  Schedule Slot {index + 1}
                </label>
                {/* Day input */}
                <input
                  type="text"
                  placeholder="Day (e.g., Monday)"
                  value={slot.day}
                  onChange={(e) => {
                    const newSchedule = [...scheduleForm.schedule];
                    newSchedule[index].day = e.target.value;
                    setScheduleForm({ ...scheduleForm, schedule: newSchedule });
                  }}
                  className="w-full p-2 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
                {/* Start Time input */}
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => {
                    const newSchedule = [...scheduleForm.schedule];
                    newSchedule[index].startTime = e.target.value;
                    setScheduleForm({ ...scheduleForm, schedule: newSchedule });
                  }}
                  className="w-full p-2 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
                {/* End Time input */}
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => {
                    const newSchedule = [...scheduleForm.schedule];
                    newSchedule[index].endTime = e.target.value;
                    setScheduleForm({ ...scheduleForm, schedule: newSchedule });
                  }}
                  className="w-full p-2 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
              </div>
            ))}

            {/* Add new schedule slot */}
            <button
              type="button"
              onClick={addScheduleSlot}
              className="bg-accent text-white p-2 rounded mb-4 transition-all duration-300 hover:bg-opacity-90"
            >
              Add Schedule Slot
            </button>
            {/* Submit button for updating schedule */}
            <button
              type="submit"
              className="w-full bg-accent text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
            >
              Update Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageDoctors;
