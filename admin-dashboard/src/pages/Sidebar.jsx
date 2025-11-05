import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { IoPersonAddSharp } from "react-icons/io5";
import { PiNotepadFill } from "react-icons/pi";
import { RiLogoutBoxFill } from "react-icons/ri";
import { TiHome } from "react-icons/ti";
import { GrAnalytics } from "react-icons/gr";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../context/ThemeContext";
import { BiSolidUserDetail } from "react-icons/bi";

const Sidebar = ({ isOpen, onClose, toggleTheme, theme, handleLogout }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const navItems = {
    admin: [
      { icon: TiHome, label: "Home", path: "/dashboard" },
      { icon: IoPersonAddSharp, label: "Register Patient", path: "/register-patient" },
      { icon: PiNotepadFill, label: "Create Appointment", path: "/create-appointment" },
      { icon: FaUserDoctor, label: "Manage Doctors", path: "/manage-doctors" },
      { icon: IoPersonAddSharp, label: "Blood Bank", path: "/blood-bank" },
      { icon: PiNotepadFill, label: "Appointments", path: "/appointments" },
      { icon: BiSolidUserDetail, label: "Patient DB", path: "/patient-database" },
      { icon: GrAnalytics, label: "Feedback", path: "/feedback-analytics" },
    ],
    doctor: [
      { icon: TiHome, label: "Home", path: "/doctor-dashboard" },
    ],
  };

  const items = role === "admin" ? navItems.admin : navItems.doctor;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Desktop & Mobile Sidebar with Right Shadow */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-[100px] bg-sidebar 
          flex flex-col items-center py-6 space-y-6 
          transition-transform duration-300 z-50
          md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-2xl shadow-gray-900/50  /* Strong right shadow */
          md:shadow-xl md:shadow-gray-800/40  /* Softer on desktop */
        `}
        style={{
          boxShadow: "8px 0 25px -5px rgba(0, 0, 0, 0.4)", /* Custom right shadow */
        }}
      >
        {/* Navigation Icons */}
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-secondary rounded-full p-2 shadow-card hover:bg-accent transition-colors cursor-pointer"
              onClick={() => handleNavigate(item.path)}
              title={item.label}
            >
              <item.icon className="w-6 h-6 text-icon" />
            </div>
          ))}

          {/* Theme Toggle */}
          <div
            className="bg-secondary rounded-full p-2 shadow-card hover:bg-accent transition-colors cursor-pointer"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <MdLightMode className="w-6 h-6 text-icon" />
            ) : (
              <MdDarkMode className="w-6 h-6 text-icon" />
            )}
          </div>

          {/* Logout - Only in sidebar on mobile */}
          <div
            className="bg-secondary rounded-full p-2 shadow-card hover:bg-red-600 transition-colors cursor-pointer md:hidden"
            onClick={handleLogout}
          >
            <RiLogoutBoxFill className="w-6 h-6 text-icon" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;