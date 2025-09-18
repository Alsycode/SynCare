import React, { useState, useEffect } from "react";
import { fetchData } from "../axiosInstance/index.jsx";
import { Link, useLocation } from "react-router-dom";
import { CiClock2 } from "react-icons/ci";
import { SlCalender } from "react-icons/sl";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";

const socket = io("https://syncare.onrender.com/", { withCredentials: true });

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    socket.emit("join", { userId, room: userId });

    const fetchAppointments = async () => {
      try {
        const data = await fetchData("/api/appointments/patient");
        setAppointments(data);
      } catch {
        setError("Failed to fetch appointments");
      }
    };

    const fetchUnreadCounts = async () => {
      try {
        const data = await fetchData(`/api/chat/unread-counts-patient/${userId}`);
        setUnreadCounts(data);
      } catch (err) {
        setError("Failed to fetch unread message counts");
      }
    };

    const fetchAll = async () => {
      await Promise.all([fetchAppointments(), fetchUnreadCounts()]);
      setIsLoading(false);
    };

    fetchAll();

    socket.on("newMessage", (message) => {
      if (message.sender === "doctor" && location.pathname === "/dashboard") {
        const doctorId = message.doctorId;
        setUnreadCounts((prev) => ({
          ...prev,
          [doctorId]: (prev[doctorId] || 0) + 1,
        }));

        toast.info(`New message from Doctor: ${message.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 
      bg-primary text-primary"
    >
      <ToastContainer />
      <div className="card w-full max-w-6xl rounded-[50px] p-6 sm:p-8 text-primary shadow-card">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
         Your Appointments
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">
            {error}
          </div>
        )}

       

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array(3)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl bg-card border border-primary shadow-card animate-pulse"
                >
                  <div className="mb-1 h-4 bg-secondary rounded w-3/4"></div>
                  <div className="mb-1 h-4 bg-secondary rounded w-1/2"></div>
                  <div className="mb-1 h-4 bg-secondary rounded w-2/3"></div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-8 bg-secondary rounded-lg w-20"></div>
                    <div className="h-8 bg-secondary rounded-lg w-24"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-secondary">No appointments found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="p-5 rounded-xl bg-card border border-primary shadow-card 
                hover:scale-[1.02] transition-all duration-300 text-primary"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold">
                    Doctor: {appt.doctorId?.name || "N/A"}
                  </h4>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <p className="flex items-center gap-2">
                    <SlCalender className="text-accent" />
                    {new Date(appt.date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <CiClock2 className="text-accent" />
                    {appt.time}
                  </p>
                </div>

                <div className="flex  flex-wrap gap-3">
                  <span
                    className={`px-3 flex justify-center items-center py-1 rounded-full text-sm font-semibold shadow ${
                      appt.paymentStatus === "paid"
                        ? "bg-status-green text-white"
                        : "bg-status-yellow text-black"
                    }`}
                  >
                    Payment: {appt.paymentStatus}
                  </span>
                  {appt.paymentStatus === "pending" && (
                    <Link
                      to={`/pay/${appt._id}`}
                      className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                    >
                      Pay Now
                    </Link>
                  )}
                  <Link
                    to={`/video-call/${appt._id}`}
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    📹 Video Call
                  </Link>
                  <Link
                    to={`/chat/${appt.doctorId?._id}`}
                    className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    💬 Chat with Doctor
                    {unreadCounts[appt.doctorId?._id] ? (
                      <span className="ml-2 bg-status-red text-white rounded-full px-2 py-1 text-xs">
                        {unreadCounts[appt.doctorId?._id]}
                      </span>
                    ) : null}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
