import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.id);
      setToken(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "url('/back.jpg')", // change to your image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Left side with transparent overlay & centered logo */}
       <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Patient Login
          </h2>
          {error && (
            <p className="text-red-500 mb-4 text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
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
              <label className="block text-gray-700 font-medium mb-1">
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

      {/* Right side with semi-transparent white form card */}
     
    </div>
  );
}

export default Login;
