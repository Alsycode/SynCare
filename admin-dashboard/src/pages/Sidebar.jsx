import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { IoPersonAddSharp } from "react-icons/io5";
import { PiNotepadFill } from "react-icons/pi";
import { RiLogoutBoxFill } from "react-icons/ri";
import { TiHome } from "react-icons/ti";
import { GrAnalytics } from "react-icons/gr";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeContext } from "../context/ThemeContext";
import { BiSolidUserDetail } from "react-icons/bi";
export const Sidebar = () => {
  const [show, setShow] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const role = localStorage.getItem("role");
  const navigateTo = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const gotoHomePage = () => {
    navigateTo("/dashboard");
    setShow(false);
  };
  const gotoDocHomePage = () => {
    navigateTo("/doctor-dashboard");
    setShow(false);
  };
  const gotoRegisterPatient = () => {
    navigateTo("/register-patient");
    setShow(false);
  };
  const gotoCreateAppointment = () => {
    navigateTo("/create-appointment");
    setShow(false);
  };
  const gotoManageDoctors = () => {
    navigateTo("/manage-doctors");
    setShow(false);
  };
  const gotoBloodBank = () => {
    navigateTo("/blood-bank");
    setShow(false);
  };
  const gotoAppointments = () => {
    navigateTo("/appointments");
    setShow(false);
  };
  const gotoFeedbacks = () => {
    navigateTo("/feedback-analytics");
    setShow(false);
  };
  const gotoPatientDatabase = () => {
    navigateTo("/patient-database");
    setShow(false);
  };
  const handleLogout = async () => {
    try {
      toast.success("Logged out successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      setIsAuthenticated(false);
      navigateTo("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="">
      <nav className={`fixed top-0 left-0 h-full w-[120px] bg-sidebar flex flex-col justify-center items-center py-6 transition-transform duration-300 transform ${show ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50`}>
        <div className="mb-10">
          <img src="/logo1.png" className="w-24 h-auto" alt="Logo" />
        </div>
        {role === "admin" && (
          <div className="flex flex-col gap-6">
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <TiHome
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoHomePage}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <IoPersonAddSharp
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoRegisterPatient}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <PiNotepadFill
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoCreateAppointment}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <FaUserDoctor
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoManageDoctors}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <IoPersonAddSharp
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoBloodBank}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <PiNotepadFill
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoAppointments}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <BiSolidUserDetail
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoPatientDatabase}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <GrAnalytics
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoFeedbacks}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              {theme === 'dark' ? (
                <MdLightMode
                  className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                  onClick={toggleTheme}
                />
              ) : (
                <MdDarkMode
                  className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                  onClick={toggleTheme}
                />
              )}
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <RiLogoutBoxFill
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={handleLogout}
              />
            </div>
          </div>
        )}
        {role === "doctor" && (
          <div className="flex flex-col gap-6">
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <TiHome
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={gotoDocHomePage}
              />
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              {theme === 'dark' ? (
                <MdLightMode
                  className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                  onClick={toggleTheme}
                />
              ) : (
                <MdDarkMode
                  className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                  onClick={toggleTheme}
                />
              )}
            </div>
            <div className="bg-secondary rounded-full px-2 flex justify-center items-center h-10 w-10 shadow-card">
              <RiLogoutBoxFill
                className="w-6 h-6 text-icon hover:bg-accent hover:rounded-lg hover:transition-colors hover:duration-300 hover:cursor-pointer"
                onClick={handleLogout}
              />
            </div>
          </div>
        )}
      </nav>
      <div
        onClick={() => setShow(!show)}
        className="md:hidden fixed top-4 left-4 text-2xl bg-accent text-white h-10 w-10 rounded-lg flex justify-center items-center z-50 cursor-pointer"
      >
        <GiHamburgerMenu />
      </div>
    </div>
  );
};