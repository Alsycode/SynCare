import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export const Layout = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="flex min-h-screen bg-primary">
      <div className="fixed top-0 left-0 h-full z-50">
        <Sidebar />
      </div>
      <div className="flex-1 md:ml-[120px] ml-0">
        <Outlet />
      </div>
    </div>
  );
};