import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Authorization header with token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login or clear token)
      console.error("Unauthorized request. Please log in again.");
      // Optionally: localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Reusable fetchData function
export const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || "GET",
      data: options.data,
      headers: options.headers,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};