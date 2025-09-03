import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { CiClock2 } from "react-icons/ci";
import { SlCalender } from "react-icons/sl";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    socket.emit("join", { userId, room: userId });
    console.log(`Joined room: ${userId}`);

    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/appointments/patient",
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        console.log("Appointments fetched:", res.data);
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError("Failed to fetch appointments");
      }
    };

    const fetchUnreadCounts = async () => {
      try {
        console.log("Fetching unread counts for patientId:", userId);
        const res = await axios.get(
          `http://localhost:5000/api/chat/unread-counts-patient/${userId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        console.log("Unread counts fetched:", res.data);
        setUnreadCounts(res.data);
      } catch (error) {
        console.error("Failed to fetch unread counts:", error.response?.status, error.response?.data);
        setError(`Failed to fetch unread message counts: ${error.response?.data?.message || error.message}`);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchAppointments(), fetchUnreadCounts()]);
      setIsLoading(false);
    };

    fetchData();

    socket.on("newMessage", (message) => {
      console.log("New message received:", message);
      if (message.sender === "doctor" && location.pathname === "/dashboard") {
        const doctorId = message.doctorId;
        // Check if doctor name is available in appointments
        const doctor = appointments.find((appt) => appt.doctorId._id === doctorId);
        let doctorName = doctor?.doctorId.name || "Doctor";

        // Fallback to API if name not found
        if (!doctorName || doctorName === "Doctor") {
          axios.get(`http://localhost:5000/api/doctors/${doctorId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
            .then((res) => {
              doctorName = res.data.name || "Doctor";
              showNotification(doctorName, message.message);
            })
            .catch((err) => {
              console.error("Failed to fetch doctor name:", err);
              showNotification("Doctor", message.message);
            });
        } else {
          showNotification(doctorName, message.message);
        }

        // Update unread counts
        setUnreadCounts((prev) => ({
          ...prev,
          [doctorId]: (prev[doctorId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [location.pathname, appointments]);

  const showNotification = (doctorName, message) => {
    const audio = new Audio("/tone.wav");
    audio.play().catch((err) => console.error("Audio play error:", err));
    toast.info(`New message from ${doctorName}: ${message}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 
      bg-gradient-to-br from-gray-100 to-gray-300"
    >
      <ToastContainer />
      <div className="w-full max-w-5xl p-8 sm:p-10 rounded-3xl bg-white shadow-2xl">
        <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Your Appointments
        </h3>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {isLoading ? (
          <p className="text-gray-600 text-center py-6">Loading...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex rounded-2xl bg-white shadow-lg hover:shadow-xl transition-transform 
                transform hover:-translate-y-1 border border-gray-100"
              >
                <div
                  className={`w-[8px] rounded-l-2xl ${
                    appt.status === "confirmed"
                      ? "bg-gradient-to-b from-green-400 to-green-600"
                      : appt.status === "completed"
                      ? "bg-gradient-to-b from-blue-400 to-blue-600"
                      : "bg-gradient-to-b from-yellow-400 to-yellow-600"
                  }`}
                />
                <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="space-y-3 text-gray-700">
                    <p className="flex items-center gap-2">
                      <SlCalender className="text-yellow-500 text-lg" />
                      <span className="font-medium">
                        {new Date(appt.date).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CiClock2 className="text-yellow-500 text-lg" />
                      <span className="font-medium">{appt.time}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Doctor:</span>{" "}
                      {appt.doctorId.name}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Doctor ID:</span>{" "}
                      {appt.doctorId._id}
                    </p>
                  </div>
                  <div className="space-y-2 space-x-1 text-sm text-right">
                    <p>
                      <span className="font-semibold text-gray-900">Status:</span>{" "}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold text-white shadow-md ${
                          appt.status === "confirmed"
                            ? "bg-green-500"
                            : appt.status === "completed"
                            ? "bg-blue-500"
                            : "bg-yellow-500 text-black"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Payment:</span>{" "}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold text-white shadow-md ${
                          appt.paymentStatus === "paid"
                            ? "bg-green-500"
                            : "bg-yellow-500 text-black"
                        }`}
                      >
                        {appt.paymentStatus}
                      </span>
                    </p>
                    {appt.paymentStatus === "pending" && (
                      <Link
                        to={`/pay/${appt._id}`}
                        className="inline-block text-blue-500 font-medium hover:underline"
                      >
                        💳 Pay Now
                      </Link>
                    )}
                    <Link
                      to={`/video-call/${appt._id}`}
                      className="inline-block text-purple-500 font-medium hover:underline bg-black rounded-[20px] px-2 py-1"
                    >
                      📹 Video Call
                    </Link>
                    <Link
                      to={`/chat/${appt.doctorId._id}`}
                      className="inline-block text-pink-500 font-medium hover:underline bg-black rounded-[20px] px-2 py-1"
                    >
                      💬 Chat with Doctor{" "}
                      {unreadCounts[appt.doctorId._id] ? (
                        <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                          {unreadCounts[appt.doctorId._id]}
                        </span>
                      ) : null}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && !error && (
              <p className="text-gray-600 text-center py-6">
                No appointments found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;