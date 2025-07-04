// src/services/index.js
// Main services export file - this allows clean imports throughout the app

// Core API client
export { apiClient, ApiClient } from "./api";

// Individual services
export { authService } from "./auth";
export { ticketService } from "./tickets";
export { customerService } from "./customers";
export { userService } from "./users";

// Combined services object for convenience
export const services = {
  auth: authService,
  tickets: ticketService,
  customers: customerService,
  users: userService,
};

// Helper function to handle common API errors
export const handleApiError = (error) => {
  console.error("API Error:", error);

  // Check for network errors
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("fetch")
  ) {
    return "Unable to connect to server. Please check your internet connection.";
  }

  // Check for specific HTTP status codes
  if (
    error.message?.includes("401") ||
    error.message?.includes("Unauthorized")
  ) {
    return "Your session has expired. Please log in again.";
  }

  if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
    return "You do not have permission to perform this action.";
  }

  if (error.message?.includes("404") || error.message?.includes("Not Found")) {
    return "The requested resource was not found.";
  }

  if (
    error.message?.includes("500") ||
    error.message?.includes("Internal Server Error")
  ) {
    return "A server error occurred. Please try again later.";
  }

  if (
    error.message?.includes("502") ||
    error.message?.includes("Bad Gateway")
  ) {
    return "Server is temporarily unavailable. Please try again later.";
  }

  if (
    error.message?.includes("503") ||
    error.message?.includes("Service Unavailable")
  ) {
    return "Service is temporarily unavailable. Please try again later.";
  }

  // Return the original error message if no specific pattern matches
  return error.message || "An unexpected error occurred.";
};

// Validation helpers
export const validateRequiredFields = (data, requiredFields) => {
  const missing = [];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missing.push(field);
    }
  });

  return missing;
};

// Helper to validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to format API responses consistently
export const formatApiResponse = (data, message = "Success") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

// Helper to format API errors consistently
export const formatApiError = (error, code = "UNKNOWN_ERROR") => {
  return {
    success: false,
    error: {
      code,
      message: error.message || "An unexpected error occurred",
      details: error.details || null,
    },
    timestamp: new Date().toISOString(),
  };
};

// Debounce helper for API calls (useful for search inputs)
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Helper to convert query parameters to URL string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
