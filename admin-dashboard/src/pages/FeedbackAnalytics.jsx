import React, { useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

const FeedbackAnalytics = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);

  const isAuthenticated = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!isAuthenticated || role !== "admin") {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await fetchData("/api/feedback/allreviews");
        setFeedbacks(data);
      } catch (err) {
        setError(err.message || "Failed to load feedback data");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const SkeletonRow = () => (
    <tr className="hover:bg-secondary transition-colors">
      {Array(7)
        .fill()
        .map((_, index) => (
          <td key={index} className="p-2 sm:p-3 border-b border-primary">
            <div className="animate-pulse bg-secondary h-4 w-3/4 rounded" />
          </td>
        ))}
    </tr>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary"
    >
      <div className="card w-full max-w-4xl sm:max-w-6xl lg:max-w-7xl p-4 sm:p-6 lg:p-8 text-primary">
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Feedback Analytics
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded bg-status-red text-white text-center">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl card">
            <table className="min-w-full text-primary text-sm sm:text-base">
              <thead>
                <tr className="bg-secondary">
                  <th className="p-2 sm:p-3 text-left">Patient</th>
                  <th className="p-2 sm:p-3 text-left">Doctor</th>
                  <th className="p-2 sm:p-3 text-left">Date</th>
                  <th className="p-2 sm:p-3 text-left">Time</th>
                  <th className="p-2 sm:p-3 text-left">Rating</th>
                  <th className="p-2 sm:p-3 text-left">Comments</th>
                  <th className="p-2 sm:p-3 text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5)
                    .fill()
                    .map((_, index) => <SkeletonRow key={index} />)
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-2 sm:p-4 text-center text-secondary"
                    >
                      No feedback available
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((fb) => (
                    <tr
                      key={fb._id}
                      className="hover:bg-secondary transition-colors"
                    >
                      <td className="p-2 sm:p-3 border-b border-primary">
                        {fb.patientName || "Anonymous"}
                      </td>
                      <td className="p-2 sm:p-3 border-b border-primary">
                        {fb.doctorName || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 border-b border-primary">
                        {new Date(fb.appointmentDate).toLocaleDateString() || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 border-b border-primary">
                        {fb.appointmentTime || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 border-b border-primary">
                        <span className="text-status-yellow">⭐ {fb.rating}</span>
                      </td>
                      <td className="p-2 sm:p-3 border-b border-primary">{fb.comments || "N/A"}</td>
                      <td className="p-2 sm:p-3 border-b border-primary">
                        {new Date(fb.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalytics;
