// src/contexts/ThemeContext.jsx - Theme context with dark mode as default
import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always use dark mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
  }, []);

  const value = {
    isDarkMode: true,
    theme: "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
