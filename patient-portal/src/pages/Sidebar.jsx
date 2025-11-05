import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TiHome } from 'react-icons/ti';
import { FaTint } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode } from "react-icons/md";

const Sidebar = ({ open, setOpen, headerHeight = 70 }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Sidebar is now offset below the header
  // Note: [top-0] => [top-[70px]]
  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-40 z-40 md:hidden"
          style={{ top: headerHeight }}
          onClick={() => setOpen(false)}
        ></div>
      )}
      <nav
        className={`
          fixed
          left-0
          h-[calc(100vh-70px)]
          z-50
          w-[120px]
          bg-sidebar
          flex flex-col
          justify-center
          items-center
          py-[30px]
          shadow-[4px_0_6px_rgba(0,0,0,0.2)]
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ top: headerHeight }}
      >
        <div className="flex flex-col gap-[30px]">
          <Link to="/dashboard" onClick={() => setOpen(false)}>
            <div className="bg-[#212121] rounded-full shadow-amber-50 px-2 flex justify-center items-center 
                  h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer">
              <TiHome className="w-[30px] h-[30px] text-white" />
            </div>
          </Link>
          <Link to="/blood-bank" onClick={() => setOpen(false)}>
            <div className="bg-[#212121] rounded-full px-2 flex justify-center items-center 
                  h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer">
              <FaTint className="w-[30px] h-[30px] text-white" />
            </div>
          </Link>
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
          <button
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
            className="bg-[#212121] rounded-full px-2 flex justify-center items-center 
                   h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer focus:outline-none"
            title="Logout"
            aria-label="Logout"
            type="button"
          >
            <FiLogOut className="w-[30px] h-[30px] text-white" />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
