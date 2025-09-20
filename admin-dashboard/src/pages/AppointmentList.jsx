import React, { useState, useEffect, useContext } from "react";
import { fetchData } from "../axiosInstance/index"; // Import the reusable fetchData function
import { ThemeContext } from "../context/ThemeContext";

/**
 * AppointmentsList component displays a paginated and filterable list of appointments.
 * 
 * The component fetches appointments from an API endpoint, filters them based on user-selected criteria (status, payment status, date range), 
 * and supports pagination to navigate through the appointments. 
 * It also handles loading states and potential errors when fetching the data.
 * 
 * @returns {JSX.Element} A list of appointments with filter options and pagination controls.
 */
const AppointmentsList = () => {
  // State for managing the list of appointments, loading state, error state, and filters.
  const [appointments, setAppointments] = useState([]); // Stores the fetched appointment data
  const [loading, setLoading] = useState(true); // Boolean to track loading state
  const [error, setError] = useState(null); // Tracks errors during data fetching
  const [filters, setFilters] = useState({
    status: "", // Filters for appointment status (confirmed, completed, pending)
    paymentStatus: "", // Filters for payment status (paid, unpaid)
    startDate: "", // Filters for start date of appointments
    endDate: "", // Filters for end date of appointments
  });
  
  // Theme context for the app's theme (for example, light/dark mode)
  const { theme } = useContext(ThemeContext);

  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page in the paginated list
  const pageSize = 10; // Number of appointments per page

  /**
   * useEffect hook to fetch the appointments from the API when the component mounts.
   * The fetched data is stored in the state and loading state is updated.
   */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await fetchData("/api/appointments/admin/all"); // Fetch the appointment data
        setAppointments(data.data); // Set the fetched appointments to state
        setLoading(false); // Set loading state to false
      } catch (err) {
        setError("Failed to load appointments"); // Set error state if fetch fails
        setLoading(false); // Set loading state to false
      }
    };
    fetchAppointments(); // Trigger the fetch operation
  }, []);

  /**
   * Filters the appointments based on the selected filters from the state.
   * 
   * @param {Object} appointment - The appointment object to be checked.
   * @returns {boolean} - Returns true if the appointment matches all active filters, else false.
   */
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

  // Pagination calculation: Total number of pages based on filtered appointments
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page to 1 whenever the filters or filtered appointments change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, filteredAppointments.length]);

  /**
   * Handles changes to filter inputs and updates the filters state.
   * 
   * @param {Object} e - The event object from the input change.
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Decreases the current page by 1, ensuring that it does not go below 1.
   */
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  /**
   * Increases the current page by 1, ensuring that it does not exceed the total number of pages.
   */
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  /**
   * Skeleton row component for loading state. Displays animated placeholder rows while data is being loaded.
   */
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

  // Loading state: Displays a skeleton loader when data is being fetched.
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

  // Error state: Displays an error message if the fetch operation fails.
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 bg-primary">
        <div className="card w-full max-w-4xl sm:max-w-6xl lg:max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="bg-status-red text-white text-center p-3 rounded">{error}</div>
        </div>
      </div>
    );
  }

  // Main content: Displays the filtered and paginated list of appointments.
  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary">
      <div className="card w-full max-w-4xl sm:max-w-6xl lg:max-w-7xl p-4 sm:p-6 lg:p-8 text-primary">
               <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">All Appointments</h1>

        {/* Filter Controls */}
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

        {/* Appointments Table */}
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
              {/* Render the paginated list of appointments */}
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
              {/* Message if no appointments match the filters */}
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
          {/* Previous Page Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {/* Page Info */}
          <span className="self-center">
            Page {currentPage} of {totalPages}
          </span>
          
          {/* Next Page Button */}
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

