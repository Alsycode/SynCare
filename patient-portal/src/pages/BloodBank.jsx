import React, { useState, useEffect } from "react";
import axios from "axios";
import { SlCalender } from "react-icons/sl";
import { CiClock2 } from "react-icons/ci"; // optional if you want a timestamp icon

function BloodBank() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/blood-bank/availability",
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setInventory(res.data);
      } catch (err) {
        setError("Failed to fetch blood bank data");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="flex rounded-2xl bg-white shadow-md border border-gray-100 animate-pulse">
      <div className="w-[8px] bg-gray-300 rounded-l-2xl" />
      <div className="flex-1 p-6 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="space-y-3 w-full sm:w-1/2">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-36"></div>
        </div>
        <div className="space-y-3 w-full sm:w-1/2 text-right">
          <div className="h-4 bg-gray-300 rounded w-24 ml-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-20 ml-auto"></div>
        </div>
      </div>
    </div>
  );

  // Choose color strip by blood group
  const getStripColor = (group) => {
    if (["O+", "O-"].includes(group)) return "bg-gradient-to-b from-red-400 to-red-600";
    if (["A+", "A-"].includes(group)) return "bg-gradient-to-b from-pink-400 to-pink-600";
    if (["B+", "B-"].includes(group)) return "bg-gradient-to-b from-yellow-400 to-yellow-600";
    if (["AB+", "AB-"].includes(group)) return "bg-gradient-to-b from-purple-400 to-purple-600";
    return "bg-gradient-to-b from-gray-400 to-gray-600";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full max-w-5xl p-8 sm:p-10 rounded-3xl bg-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Blood Bank Availability
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500 text-white text-center">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          {loading
            ? Array(3).fill().map((_, idx) => <SkeletonCard key={idx} />)
            : inventory.map((item) => (
                <div
                  key={item._id}
                  className="flex rounded-2xl bg-white shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Color Strip */}
                  <div className={`w-[8px] rounded-l-2xl ${getStripColor(item.bloodGroup)}`} />

                  {/* Card Content */}
                  <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    {/* Left Info */}
                    <div className="space-y-2 text-gray-700">
                      <p className="text-lg font-semibold">
                        Blood Group: <span className="uppercase">{item.bloodGroup}</span>
                      </p>
                      <p>
                        Quantity:{" "}
                        <span className="font-medium">{item.quantity} Units</span>
                      </p>
                    </div>

                    {/* Right Info */}
                    <div className="text-sm text-gray-600 text-right">
                      <p className="flex items-center gap-2 justify-end">
                        <SlCalender className="text-yellow-500" />
                        Last Updated:{" "}
                        <span className="font-medium">
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}

          {!loading && inventory.length === 0 && !error && (
            <p className="text-gray-600 text-center py-6">No records found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BloodBank;
