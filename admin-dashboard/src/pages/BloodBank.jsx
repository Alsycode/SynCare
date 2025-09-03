import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance";
function BloodBank() {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ bloodGroup: "", quantityAscend: true, quantity: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme } = useContext(ThemeContext);

useEffect(() => {
  const fetchInventory = async () => {
    try {
      const data = await fetchData("/api/blood-bank/availability");
      setInventory(data);
    } catch (err) {
      setError(err.message || "Failed to fetch blood bank data");
    }
  };
  fetchInventory();
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await fetchData("/api/blood-bank/update", {
      method: "PUT",
      data: formData,
    });
    setSuccess("Blood bank updated successfully");
    setError("");
    setFormData({ bloodGroup: "", quantity: "" });
    const data = await fetchData("/api/blood-bank/availability");
    setInventory(data);
  } catch (err) {
    setError(err.message || "Failed to update blood bank");
    setSuccess("");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 py-12 rounded-bl-[50px] rounded-tl-[50px] bg-primary">
      <div className="card w-full max-w-4xl sm:max-w-5xl p-6 sm:p-8 text-primary">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Manage Blood Bank</h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-status-green text-white text-center">{success}</div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 rounded-xl card flex flex-col gap-3 mb-8"
        >
          <div className="mb-2">
            <label className="block mb-1 text-primary">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) =>
                setFormData({ ...formData, bloodGroup: e.target.value })
              }
              className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1 text-primary">Quantity (Units)</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full p-2 sm:p-3 rounded bg-secondary border border-primary text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              placeholder="Enter quantity"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-opacity-90"
          >
            Update Blood Bank
          </button>
        </form>

        <h3 className="text-lg sm:text-xl font-semibold mb-4">Blood Bank Inventory</h3>
        <div className="overflow-x-auto rounded-2xl card">
          <table className="min-w-full text-primary text-sm sm:text-base">
            <thead>
              <tr className="bg-secondary">
                <th className="p-2 sm:p-3 text-left">Blood Group</th>
                <th className="p-2 sm:p-3 text-left">Quantity (Units)</th>
                <th className="p-2 sm:p-3 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-secondary transition-colors"
                >
                  <td className="p-2 sm:p-3 border-b border-primary">
                    {item.bloodGroup}
                  </td>
                  <td className="p-2 sm:p-3 border-b border-primary">
                    {item.quantity}
                  </td>
                  <td className="p-2 sm:p-3 border-b border-primary">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
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
}

export default BloodBank;