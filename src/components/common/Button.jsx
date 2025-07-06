import React from "react";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm";

  const variants = {
    primary:
      "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500 shadow-blue-500/25",
    secondary:
      "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500 focus:ring-slate-500 border border-slate-300 dark:border-slate-500",
    danger:
      "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 shadow-red-500/25",
    ghost:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-slate-500 border border-transparent hover:border-slate-200 dark:hover:border-slate-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
