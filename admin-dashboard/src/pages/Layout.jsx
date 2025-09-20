import Sidebar from "./Sidebar"; // Import the Sidebar component
import { Outlet } from "react-router-dom"; // Outlet renders the matched child routes
import { useContext } from "react"; // React hook to consume context values
import { ThemeContext } from "../context/ThemeContext"; // Import the custom ThemeContext

// Layout component defines the main page structure (Sidebar + Main content)
export const Layout = () => {
  // Access the current theme value from ThemeContext
  const { theme } = useContext(ThemeContext);

  return (
    // Main container with flex to arrange child elements side by side
    // min-h-screen ensures it takes at least full screen height
    // bg-primary applies the background color from Tailwind theme
    <div className="flex min-h-screen bg-primary">
      
      {/* Sidebar: fixed positioning ensures it's always visible on the left */}
      <div className="fixed top-0 left-0 h-full z-50">
        {/* Sidebar component renders app navigation/menu */}
        <Sidebar />
      </div>

      {/* Main content area */}
      {/* flex-1 allows this section to take up remaining space */}
      {/* md:ml-[120px] adds left margin only on medium+ screens 
          so content doesn’t overlap the Sidebar */}
      {/* ml-0 removes margin on small screens (Sidebar may collapse there) */}
      <div className="flex-1 md:ml-[120px] ml-0">
        {/* Outlet renders the nested route content defined in react-router */}
        <Outlet />
      </div>
    </div>
  );
};
