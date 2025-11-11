import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeContext } from "./context/ThemeContext";
import { Layout } from "./pages/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegisterPatient from "./pages/RegisterPatient";
import CreateAppointment from "./pages/CreateAppointment";
import ManageDoctors from "./pages/ManageDoctors";
import DoctorDashboard from "./pages/DoctorDashboard";
import BloodBank from "./pages/BloodBank";
import AppointmentsListPage from "./pages/AppointmentList";
import Chat from "./pages/Chat";
import VideoCall from "./pages/VideoCall";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";
import PatientListAdmin from "./pages/PatientDatabse";
import PatientDetail from "./pages/PatientDetail";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const role = localStorage.getItem("role");
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login setToken={setToken} />} />

        {/* ✅ Admin Routes */}
        <Route
          element={
            token && role === "admin" ? (
              <Layout />
            ) : token && role === "doctor" ? (
              <Navigate to="/doctor-dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register-patient" element={<RegisterPatient />} />
          <Route path="/create-appointment" element={<CreateAppointment />} />
          <Route path="/manage-doctors" element={<ManageDoctors />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/appointments" element={<AppointmentsListPage />} />
          <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
          <Route path="/patient-database" element={<PatientListAdmin />} />
          <Route path="/patient/:patientId" element={<PatientDetail />} />
        </Route>

        {/* ✅ Doctor Routes */}
        <Route
          element={
            token && role === "doctor" ? (
              <Layout />
            ) : token && role === "admin" ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-dashboard/chat/:patientId" element={<Chat />} />
          <Route path="/video-call/:roomId" element={<VideoCall />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
