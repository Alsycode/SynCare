import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TiHome } from 'react-icons/ti';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import { PiNotepadFill } from 'react-icons/pi';
import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import { FaTint } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi'; // Logout icon
import { useContext } from 'react';
const Sidebar = () => {
  const navigate = useNavigate();
const { theme, toggleTheme } = useContext(ThemeContext);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className="fixed w-[120px] bg-sidebar flex flex-col justify-center h-full items-center py-[30px]">
      {/* Sidebar Icons */}
      <div className="flex flex-col gap-[30px]">
        <Link to="/dashboard">
          <div className="bg-[#212121] rounded-full shadow-amber-50 px-2 flex justify-center items-center 
                       h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer">
            <TiHome className="w-[30px] h-[30px] text-white" />
          </div>
        </Link>

        {/* <Link to="/pay/123">
          <div className="bg-[#212121] rounded-full px-2 flex justify-center items-center 
                       h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer">
            <RiMoneyDollarCircleFill className="w-[30px] h-[30px] text-white" />
          </div>
        </Link>

        <Link to="/feedback/123">
          <div className="bg-[#212121] rounded-full px-2 flex justify-center items-center 
                       h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer">
            <PiNotepadFill className="w-[30px] h-[30px] text-white" />
          </div>
        </Link> */}

        {/* <Link to="/chat/123">
          <div className="bg-[#212121] rounded-full px-2 flex justify-center items-center 
                       h-[50px] w-[50px] hover:bg-gray-700 transition-all duration-300 cursor-pointer">
            <IoChatbubbleEllipsesSharp className="w-[30px] h-[30px] text-white" />
          </div>
        </Link> */}

        <Link to="/blood-bank">
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
        {/* Logout Button */}
        <button
          onClick={handleLogout}
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
  );
};

export default Sidebar;
