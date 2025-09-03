import React, { useState, useEffect, useContext } from "react";
import { fetchData } from "../axiosInstance/index"; // Import the reusable fetchData function
import { ThemeContext } from "../context/ThemeContext";

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });
  const { theme } = useContext(ThemeContext);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await fetchData("/api/appointments/admin/all");
        setAppointments(data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load appointments");
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      !filters.status || appointment.status === filters.status;
    const matchesPaymentStatus =
      !filters.paymentStatus || appointment.paymentStatus === filters.paymentStatus;
    const appointmentDate = new Date(appointment.date);
    const matchesDateRange =
      (!filters.startDate || appointmentDate >= new Date(filters.startDate)) &&
      (!filters.endDate || appointmentDate <= new Date(filters.endDate));

    return matchesStatus && matchesPaymentStatus && matchesDateRange;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page to 1 on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, filteredAppointments.length]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-2 sm:p-3 border-b border-primary">
        <div className="h-4 bg-secondary rounded w-3/4"></div>
      </td>
      <td className="p-2 sm:p-3 border-b border-primary">
        <div className="h-4 bg-secondary rounded w-3/4"></div>
      </td>
      <td className="p-2 sm:p-3 border-b border-primary">
        <div className="h-4 bg-secondary rounded w-1/2"></div>
      </td>
      <td className="p-2 sm:p-3 border-b border-primary">
        <div className="h-4 bg-secondary rounded w-1/2"></div>
      </td>
      <td className="p-2 sm:p-3 border-b border-primary">
        <div className="h-4 bg-secondary rounded w-1/3"></div>
      </td>
      <td className="p-2 sm:p-3 border-b border-primary">
        <div className="h-4 bg-secondary rounded w-1/3"></div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 bg-primary">
        <div className="card w-full max-w-4xl sm:max-w-6xl lg:max-w-7xl p-4 sm:p-6 lg:p-8 text-primary">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-1/4 mx-auto mb-6"></div>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6">
              <div className="h-10 bg-secondary rounded-lg w-32 sm:w-40"></div>
              <div className="h-10 bg-secondary rounded-lg w-32 sm:w-40"></div>
              <div className="h-10 bg-secondary rounded-lg w-32 sm:w-40"></div>
              <div className="h-10 bg-secondary rounded-lg w-32 sm:w-40"></div>
            </div>
            <div className="overflow-x-auto rounded-2xl card">
              <table className="min-w-full text-primary text-sm sm:text-base">
                <thead>
                  <tr className="bg-secondary">
                    <th className="p-2 sm:p-3 text-center">Patient</th>
                    <th className="p-2 sm:p-3 text-center">Doctor</th>
                    <th className="p-2 sm:p-3 text-center">Date</th>
                    <th className="p-2 sm:p-3 text-center">Time</th>
                    <th className="p-2 sm:p-3 text-center">Status</th>
                    <th className="p-2 sm:p-3 text-center">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5)
                    .fill()
                    .map((_, index) => (
                      <SkeletonRow key={index} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 bg-primary">
        <div className="card w-full max-w-4xl sm:max-w-6xl lg:max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="bg-status-red text-white text-center p-3 rounded">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary">
      <div className="card w-full max-w-4xl sm:max-w-6xl lg:max-w-7xl p-4 sm:p-6 lg:p-8 text-primary">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">All Appointments</h1>

        <div className="mb-6 flex flex-wrap gap-3 sm:gap-4 justify-center">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 sm:p-3 rounded-lg bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <select
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            className="p-2 sm:p-3 rounded-lg bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <label className="text-primary flex items-center gap-2">
            Start date:
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="p-2 sm:p-3 rounded-lg bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
            />
          </label>
          <label className="text-primary flex items-center gap-2">
            End date:
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="p-2 sm:p-3 rounded-lg bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-2xl card">
          <table className="min-w-full text-primary text-sm sm:text-base">
            <thead>
              <tr className="bg-secondary">
                <th className="p-2 sm:p-3 text-center">Patient</th>
                <th className="p-2 sm:p-3 text-center">Doctor</th>
                <th className="p-2 sm:p-3 text-center">Date</th>
                <th className="p-2 sm:p-3 text-center">Time</th>
                <th className="p-2 sm:p-3 text-center">Status</th>
                <th className="p-2 sm:p-3 text-center">Payment</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-secondary transition-colors">
                  <td className="p-2 sm:p-3 border-b border-primary">{appointment.patientId?.name || "N/A"}</td>
                  <td className="p-2 sm:p-3 border-b border-primary">{appointment.doctorId?.name || "N/A"}</td>
                  <td className="p-2 sm:p-3 border-b border-primary">{new Date(appointment.date).toLocaleDateString()}</td>
                  <td className="p-2 sm:p-3 border-b border-primary">{appointment.time}</td>
                  <td className="p-2 sm:p-3 border-b border-primary">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold bg-opacity-70 ${
                        appointment.status === "confirmed"
                          ? "bg-status-green"
                          : appointment.status === "completed"
                          ? "bg-status-blue"
                          : "bg-status-yellow"
                      } text-white`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 border-b border-primary">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold bg-opacity-70 ${
                        appointment.paymentStatus === "paid" ? "bg-status-green" : "bg-status-yellow"
                      } text-white`}
                    >
                      {appointment.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-2 sm:p-4 text-secondary">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="self-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
