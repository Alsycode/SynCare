import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { fetchData } from "../axiosInstance/index"; // Import your custom axios instance

function FeedbackForm() {
  const { appointmentId } = useParams();
  const [formData, setFormData] = useState({ rating: 5, comments: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid feedback link: Token missing");
      return;
    }

    // Validate token with backend (simplified check)
    fetchData(`/api/appointments/validate/${appointmentId}`, {
  method: "GET",
  headers: { Authorization: `Bearer ${token}` }
}).then((res) => {
        if (res.valid) setIsValid(true);
        else setError("Invalid or expired feedback link");
      })
      .catch(() => setError("Failed to validate feedback link"));
  }, [appointmentId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please use a valid feedback link");
      return;
    }
    try {
     await fetchData('/api/feedback', {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  data: {
    appointmentId,
    rating: formData.rating,
    comments: formData.comments,
  }
});
      setSuccess("Feedback submitted successfully!");
      setError("");
      setFormData({ rating: 5, comments: "" });
    } catch (err) {
      setError("Failed to submit feedback");
      setSuccess("");
    }
  };

  if (!isValid && error)
    return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Submit Feedback</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Rating (1-5)</label>
            <select
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
              required
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Share your thoughts..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!isValid}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;
