import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import React, { useState } from "react";

const Layout = () => {
  const userName = localStorage.getItem('name') || 'Guest';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-primary transition-all duration-300">
      {/* Header */}
      <div className="h-[70px] flex w-full bg-black md:px-20 px-4 py-4 justify-between items-center border-b-2 border-red-300 sticky top-0 z-50">
        <div>
          <img src="/logo1.png" className="h-12 w-auto" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-green-500 text-sm font-semibold">{userName}</span>
          </div>
          <div className="rounded-full w-10 h-10 border border-red-200 flex justify-center items-center relative">
            <img src="/User-Profile-PNG-File.png" className="w-full h-full object-cover rounded-full" />
            <div className="h-3 w-3 rounded-full bg-green-400 border-[1px] border-white absolute top-0 right-0"></div>
          </div>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-white text-3xl ml-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          &#9776;
        </button>
      </div>
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} headerHeight={70} />
        <div className="flex-1 bg-doc min-h-screen transition-all duration-300 pt-4 md:ml-[120px] ml-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
