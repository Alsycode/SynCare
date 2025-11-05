import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { RiLogoutBoxFill } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Layout = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      toast.success("Logged out successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Header - Always Visible */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black shadow-lg z-50 flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/logo1.png" alt="Logo" className="h-[150px] w-auto" />
        </div>

        {/* Right Side: Logout (md+) + Hamburger (mobile) */}
        <div className="flex items-center gap-3">
          {/* Logout Button - Hidden on mobile */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 bg-secondary text-icon px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <RiLogoutBoxFill className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>

          {/* Hamburger - Only on mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white bg-accent p-2 rounded-lg"
          >
            <GiHamburgerMenu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        toggleTheme={toggleTheme}
        theme={theme}
        handleLogout={handleLogout}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 mt-16 md:ml-[100px]">
        <Outlet />
      </main>
    </div>
  );
};