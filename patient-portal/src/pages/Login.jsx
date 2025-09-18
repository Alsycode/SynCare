import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../axiosInstance/index.jsx'; // Import your custom Axios instance

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form submitted with email:", email, "password:", password);
  try {
    const res = await fetchData('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    console.log("Response token:", res.token);
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', res.id);
      localStorage.setItem('name', res.name);
    setToken(res.token);
    navigate('/dashboard');
  } catch (err) {
    console.error("Error in handleSubmit:", err);
    setError('Invalid credentials');
  }
};


  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "url('/back.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10">
          <h2 className="text-3xl font-bold mb-6  text-gray-800">
            Patient Login
          </h2>
          {error && (
            <p className="text-red-500 mb-4 text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-start font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-start font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold p-3 rounded-xl shadow-md transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
      <div className="hidden md:flex w-1/2 items-center justify-center bg-black/50">
        <img
          src="/logo1.png"
          alt="Login illustration"
          className="max-w-xs md:max-w-sm lg:max-w-md"
        />
      </div>
    </div>
  );
}

export default Login;