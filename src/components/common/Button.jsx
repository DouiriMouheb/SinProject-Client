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
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variants = {
    primary:
      "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500",
    secondary:
      "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-gray-500",
    danger:
      "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-gray-500",
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
