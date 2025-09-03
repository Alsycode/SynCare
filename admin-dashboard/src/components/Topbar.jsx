
import { ThemeToggle } from "./ThemeToggle";
export const TopBar = () => (
  <nav className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white dark:bg-gray-900 shadow px-4 z-50">
    <img src="/logo1.png" alt="Logo" className="h-30 mr-4" />
    <div className="flex-grow" />
    <ThemeToggle />
  </nav>
);
