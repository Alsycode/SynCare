import React, { useState, useEffect, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);
  const [visibleCount] = useState(5); // Fixed to show only 5 appointments
  const navigate = useNavigate();
console.log("appointments",appointments);

  const isAuthenticated = !!localStorage.getItem("token");
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await fetchData("/api/appointments/admin/all");
        setAppointments(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load appointments");
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const SkeletonRow = () => (
    <tr className="hover:bg-secondary transition-colors">
      {Array(7)
        .fill()
        .map((_, index) => (
          <td key={index} className="py-2 px-3 border-b border-primary">
            <div className="animate-pulse bg-secondary h-4 w-3/4 rounded" />
          </td>
        ))}
    </tr>
  );

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}
    >
      <div className="card w-full max-w-7xl rounded-[50px] p-6 sm:p-8 text-primary">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-5 flex-wrap">
            <div className="card flex-[3] flex flex-col md:flex-row items-center rounded-xl p-5 backdrop-blur-lg border border-primary shadow-card hover:scale-105 transition-transform">
              <img
                src="/doc.png"
                alt="docImg"
                className="h-24 md:h-32 mr-0 md:mr-5 mb-4 md:mb-0"
              />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Hello, <span className="text-accent">Admin</span>
                </h2>
                <p className="text-secondary">
                  Welcome to the Admin Dashboard. Manage your hospital operations efficiently.
                </p>
              </div>
            </div>
            <div className="card flex-1 rounded-xl p-4 text-primary backdrop-blur-lg border border-primary shadow-card hover:scale-105 transition-transform">
              <p className="text-base md:text-lg font-medium tracking-wide">
                Total Appointments
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2">
                {loading ? (
                  <div className="animate-pulse bg-secondary h-8 w-16 rounded" />
                ) : (
                  appointments.length
                )}
              </h3>
            </div>
            <div className="card flex-1 rounded-xl p-4 text-primary backdrop-blur-lg border border-primary shadow-card hover:scale-105 transition-transform">
              <p className="text-base md:text-lg font-medium tracking-wide">
                Registered Doctors
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2">10</h3>
            </div>
          </div>
          <div className="w-full text-left text-xl font-bold"><h2>Pending Appointments</h2></div>
          <div className="overflow-x-auto rounded-2xl bg-card border border-primary shadow-card">
            <table className="min-w-full text-primary text-sm md:text-base">
              <thead>
                <tr className="bg-secondary">
                  <th className="py-2 px-3 text-center">Patient</th>
                  <th className="py-2 px-3 text-center">Doctor</th>
                  <th className="py-2 px-3 text-center">Date</th>
                  <th className="py-2 px-3 text-center">Time</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-center">Payment</th>
                  <th className="py-2 px-3 text-center">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5)
                    .fill()
                    .map((_, index) => <SkeletonRow key={index} />)
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="py-3 px-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-3 px-4 text-center text-secondary">
                      No appointments available
                    </td>
                  </tr>
                ) : (
                  appointments.filter((item)=>item.status === "pending").slice(0, visibleCount).map((a) => (
                    <tr key={a._id} className="hover:bg-secondary transition-colors">
                      <td className="py-2 px-3 border-b border-primary">
                        {a.patientId?.name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        {a.doctorId?.name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 border-b border-primary">{a.time}</td>
                      <td className="py-2 px-3 border-b border-primary">
                        <span
                          className={`px-2 py-1 rounded-full text-xs md:text-sm font-semibold ${
                            a.status === "confirmed"
                              ? "bg-status-green"
                              : a.status === "completed"
                              ? "bg-status-blue"
                              : "bg-status-yellow"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        <span
                          className={`px-2 py-1 rounded-full text-xs md:text-sm font-semibold ${
                            a.paymentStatus === "paid"
                              ? "bg-status-green"
                              : "bg-status-yellow"
                          }`}
                        >
                          {a.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-b border-primary">
                        {a.feedback ? (
                          <>
                            <span className="text-yellow-300">
                              ⭐ {a.feedback.rating}
                            </span>
                            {a.feedback.comments && (
                              <span className="ml-2 text-secondary">
                                {a.feedback.comments.slice(0, 20)}
                                {a.feedback.comments.length > 20 ? "..." : ""}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-secondary">No feedback</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && !error && appointments.length > visibleCount && (
              <div className="flex justify-center">
                <button
                  className="mt-4 px-6 py-2 rounded bg-accent text-white font-bold mb-2 hover:bg-accent-dark transition"
                  onClick={() => navigate("/appointments")}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
