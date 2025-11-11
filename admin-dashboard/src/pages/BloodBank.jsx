import React, { useState, useEffect, useContext, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance";

/**
 * BloodBank component allows the user to manage blood bank inventory.
 * It supports viewing current blood bank inventory and updating the quantity of specific blood groups.
 */
const BloodBank = () => {
  // State variables
  const [inventory, setInventory] = useState([]); // Stores the blood bank inventory data
  const [formData, setFormData] = useState({ bloodGroup: "", quantity: "" }); // Stores the form input data
  const [error, setError] = useState(""); // Stores any error messages
  const [success, setSuccess] = useState(""); // Stores success messages
  const { theme } = useContext(ThemeContext); // Accesses the current theme

  const quantityInputRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Effect hook to fetch initial blood bank inventory when the component mounts
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Fetches blood bank data from the API
        const data = await fetchData("/api/blood-bank/availability");
        setInventory(data); // Sets inventory data into state
      } catch (err) {
        // Sets error message if fetching fails
        setError(err.message || "Failed to fetch blood bank data");
      }
    };
    fetchInventory(); // Calls fetchInventory function when the component mounts
  }, []); // Empty dependency array ensures it runs once when the component mounts

  /**
   * Handles form submission to update the blood bank inventory.
   * It updates the blood group quantity and immediately updates UI optimistically.
   *
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior
    if (!formData.bloodGroup || !formData.quantity) {
      setError("Please fill all fields");
      setSuccess("");
      return;
    }
    const quantityNum = Number(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a positive number");
      setSuccess("");
      return;
    }
    try {
      // Optimistic UI update: update inventory locally first
      setInventory((prevInventory) => {
        const existingIndex = prevInventory.findIndex(
          (item) => item.bloodGroup === formData.bloodGroup
        );
        if (existingIndex !== -1) {
          const updated = [...prevInventory];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: quantityNum,
            lastUpdated: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prevInventory,
            {
              _id: `temp-${formData.bloodGroup}`,
              bloodGroup: formData.bloodGroup,
              quantity: quantityNum,
              lastUpdated: new Date().toISOString(),
            },
          ];
        }
      });

      // Sends the updated blood bank data to the API
      await fetchData("/api/blood-bank/update", {
        method: "PUT",
        data: formData, // Sends form data to update blood bank inventory
      });
      setSuccess("Blood bank updated successfully"); // Sets success message on successful update
      setError(""); // Clears any previous error messages
      setFormData({ bloodGroup: "", quantity: "" }); // Clears the form inputs after successful submission
    } catch (err) {
      // Revert optimistic update by refetching server data
      try {
        const data = await fetchData("/api/blood-bank/availability");
        setInventory(data);
      } catch (_) {
        // Ignore nested fetch error
      }
      setError(err.message || "Failed to update blood bank");
      setSuccess(""); // Clears any previous success message
    }
  };

  // Debounce quantity input changes to reduce rapid state updates
  const handleQuantityChange = (e) => {
    const val = e.target.value;
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setFormData((prev) => ({ ...prev, quantity: val }));
    }, 300);
  };

  const handleBloodGroupChange = (e) => {
    setFormData((prev) => ({ ...prev, bloodGroup: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary">
      <div className="card w-full max-w-4xl sm:max-w-5xl p-6 sm:p-8 text-primary">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Manage Blood Bank</h2>

        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">{error}</div>
        )}

        {/* Success message display */}
        {success && (
          <div className="mb-4 p-3 rounded bg-status-green text-white text-center">{success}</div>
        )}

        {/* Form to update blood bank inventory */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-xl card flex flex-col gap-3 mb-8">
          <div className="mb-2">
            <label htmlFor="bloodGroup" className="block mb-1 text-primary">
              Blood Group
            </label>
            <select
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleBloodGroupChange}
              className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label htmlFor="quantity" className="block mb-1 text-primary">
              Quantity (Units)
            </label>
            <input
              id="quantity"
              type="number"
              defaultValue={formData.quantity}
              onChange={handleQuantityChange}
              ref={quantityInputRef}
              className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              placeholder="Enter quantity"
              required
              min="1"
            />
          </div>

          {/* Submit button to update blood bank */}
          <button
            type="submit"
            className="w-full bg-accent text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
          >
            Update Blood Bank
          </button>
        </form>

        {/* Section displaying the current blood bank inventory */}
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Blood Bank Inventory</h3>
        <div className="overflow-x-auto rounded-2xl card">
          <table className="min-w-full text-primary text-sm sm:text-base">
            <thead>
              <tr className="bg-secondary">
                <th className="p-2 sm:p-3 text-left" scope="col">Blood Group</th>
                <th className="p-2 sm:p-3 text-left" scope="col">Quantity (Units)</th>
                <th className="p-2 sm:p-3 text-left" scope="col">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through inventory data to display it in the table */}
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-secondary transition-colors">
                  <td className="p-2 sm:p-3 border-b border-primary">{item.bloodGroup}</td>
                  <td className="p-2 sm:p-3 border-b border-primary">{item.quantity}</td>
                  <td className="p-2 sm:p-3 border-b border-primary">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {/* Display a message if no records are available */}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-2 sm:p-3 text-center text-secondary">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BloodBank;
