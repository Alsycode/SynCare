import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation
import { fetchData } from "../axiosInstance/index"; // Custom axios wrapper for API requests

// Login component receives setToken as prop (to update parent state after login)
const Login = ({ setToken }) => {
  // Local state for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State to hold error messages
  const [error, setError] = useState("");

  // React Router's navigation hook
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents browser refresh
    try {
      // Send login request using fetchData helper
      const data = await fetchData("/api/auth/login", {
        method: "POST",
        data: { email, password },
      });

      // Save authentication details in localStorage for persistence
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.id);

      // Update app-level authentication state with the new token
      setToken(data.token);

      // Redirect user based on role (doctor → doctor-dashboard, else normal dashboard)
      navigate(data.role === "doctor" ? "/doctor-dashboard" : "/dashboard");
    } catch (err) {
      // If error occurs (e.g. invalid credentials), show error message on screen
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    // Outer container with full screen height and flex layout
    // Applies background image with Tailwind inline styles
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "url('/back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* LEFT SIDE (Login Card / Branding) */}
      {/* Hidden on small screens, takes half-width on md+ screens */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-black/50">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Admin / Doctor Login
          </h2>

          {/* Error message block (shown only if error exists) */}
          {error && (
            <p className="text-red-500 mb-4 text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input field */}
            <div>
              <label className="block text-gray-700 text-left font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Password input field */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-left">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Submit/Login button */}
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold p-3 rounded-xl shadow-md transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE (Illustration / Logo) */}
      {/* Visible on all screen sizes, takes half-width on md+, full-width on mobile */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-12">
        <img
          src="/logo1.png"
          alt="Login Illustration"
          className="max-w-xs md:max-w-sm lg:max-w-md"
        />
      </div>
    </div>
  );
};

export default Login;
