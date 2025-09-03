import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

function RegisterPatient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    medicalHistory: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchData("/api/patients/register", {
        method: "POST",
        data: formData,
      });
      setSuccess("Patient registered successfully");
      setError("");
      setFormData({ name: "", email: "", phone: "", medicalHistory: "" });
    } catch (err) {
      setError(err.message || "Failed to register patient");
      setSuccess("");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary"
    >
      <div className="card w-full max-w-lg p-8 sm:p-10 backdrop-blur-xl text-primary">
        <h2 className="text-3xl font-bold mb-6 text-center">Register Patient</h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/70 text-white text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-green-500/70 text-white text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 flex text-left text-primary">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none"
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-left mb-1 text-primary">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none"
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-left mb-1 text-primary">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex text-left mb-1 text-primary">Medical History</label>
            <textarea
              value={formData.medicalHistory}
              onChange={(e) =>
                setFormData({ ...formData, medicalHistory: e.target.value })
              }
              className="w-full p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none"
              placeholder="Enter medical history (if any)"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPatient;
