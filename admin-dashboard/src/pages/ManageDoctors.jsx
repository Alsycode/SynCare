import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });
  const [scheduleForm, setScheduleForm] = useState({
    doctorId: "",
    schedule: [{ day: "", startTime: "", endTime: "" }],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await fetchData("/api/doctors/list");
        setDoctors(data);
      } catch {
        setError("Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await fetchData("/api/doctors/add", {
        method: "POST",
        data: formData,
      });
      setSuccess("Doctor added successfully");
      setError("");
      setFormData({ name: "", email: "", phone: "", specialty: "" });
      const data = await fetchData("/api/doctors/list");
      setDoctors(data);
    } catch {
      setError("Failed to add doctor");
      setSuccess("");
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      await fetchData(`/api/doctors/schedule/${scheduleForm.doctorId}`, {
        method: "PUT",
        data: { schedule: scheduleForm.schedule },
      });
      setSuccess("Schedule updated successfully");
      setError("");
      setScheduleForm({
        ...scheduleForm,
        schedule: [{ day: "", startTime: "", endTime: "" }],
      });
    } catch {
      setError("Failed to update schedule");
      setSuccess("");
    }
  };

  const addScheduleSlot = () => {
    setScheduleForm({
      ...scheduleForm,
      schedule: [...scheduleForm.schedule, { day: "", startTime: "", endTime: "" }],
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary">
      <div className="card w-full max-w-4xl sm:max-w-5xl p-6 sm:p-8 text-primary">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Manage Doctors</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-status-green text-white">{success}</div>
        )}

        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Add Doctor</h3>
          <form
            onSubmit={handleAddDoctor}
            className="p-4 sm:p-6 rounded-xl card flex flex-col gap-3"
          >
            {["name", "email", "phone", "specialty"].map((field) => (
              <div className="mb-2" key={field}>
                <label className="block mb-1 capitalize text-primary">{field}</label>
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
            <button
              type="submit"
              className="w-full bg-accent text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
            >
              Add Doctor
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Update Doctor Schedule</h3>
          <form
            onSubmit={handleUpdateSchedule}
            className="p-4 sm:p-6 rounded-xl card flex flex-col gap-3"
          >
            <div className="mb-2">
              <label className="block mb-1 text-primary">Doctor</label>
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

            {scheduleForm.schedule.map((slot, index) => (
              <div
                key={index}
                className="mb-3 p-3 sm:p-4 rounded bg-secondary border border-primary flex flex-col gap-3"
              >
                <label className="block mb-1 text-primary">
                  Schedule Slot {index + 1}
                </label>
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

            <button
              type="button"
              onClick={addScheduleSlot}
              className="bg-accent text-white p-2 rounded mb-4 transition-all duration-300 hover:bg-opacity-90"
            >
              Add Schedule Slot
            </button>
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
}

export default ManageDoctors;
