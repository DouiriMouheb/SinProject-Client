// src/components/common/ThemeToggle.jsx - Theme toggle button
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center p-2 rounded-lg
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        text-gray-700 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        hover:text-gray-900 dark:hover:text-white
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
