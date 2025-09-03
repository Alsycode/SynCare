import React from 'react';
import { Link } from 'react-router-dom';
import { TiHome } from 'react-icons/ti';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import { PiNotepadFill } from 'react-icons/pi';
import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import { FaTint } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <nav className="fixed w-[120px] bg-sidebar flex flex-col justify-center h-full items-center py-[30px]">
      
      {/* Logo */}
     

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
      </div>
    </nav>
  );
};

export default Sidebar;
