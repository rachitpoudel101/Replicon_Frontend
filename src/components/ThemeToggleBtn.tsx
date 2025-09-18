import React from "react";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggleBtn: React.FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-2">
      <button
        className={`px-2 py-1 rounded transition-colors duration-200 ${
          theme === "light"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
        }`}
        onClick={() => setTheme("light")}
        aria-label="Light mode"
      >
        Light
      </button>
      <button
        className={`px-2 py-1 rounded transition-colors duration-200 ${
          theme === "dark"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
        }`}
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
      >
        Dark
      </button>
      {/* <button
        className={`px-2 py-1 rounded transition-colors duration-200 ${
          theme === "system"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
        }`}
        onClick={() => setTheme("system")}
        aria-label="System theme"
      >
        System
      </button> */}
    </div>
  );
};

export default ThemeToggleBtn;
