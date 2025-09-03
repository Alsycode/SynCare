import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import Feedback from './pages/Feedback';
import Chat from './pages/Chat';
import BloodBank from './pages/BloodBank';
import VideoCall from './pages/VideoCall'; // Import VideoCall
import Layout from "./pages/Layout";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/feedback/:appointmentId" element={<Feedback />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route
          element={token ? <Layout /> : <Navigate to="/login" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pay/:appointmentId" element={<Payment />} />
          <Route path="/feedback/:appointmentId" element={<Feedback />} />
          <Route path="/chat/:doctorId" element={<Chat />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/video-call/:roomId" element={<VideoCall />} /> {/* Add VideoCall route */}
        </Route>
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;