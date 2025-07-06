import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./components/auth/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { TimeSheetList } from "./components/Timesheets/TimeSheetList";
import { Users } from "./components/users/Users";
import { Customers } from "./components/Customers/Customers";
import { Settings } from "./components/settings/Settings";
import { toastConfig } from "./utils/toast";

// Placeholder components for new admin routes
const Process = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Process Management
    </h1>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">
        Process and activity management functionality will be implemented here.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        This section is only accessible by administrators.
      </p>
    </div>
  </div>
);

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("timesheets"); // Default to Timesheet page
  const { user, isInitialized } = useAuth();

  // Reset to default page when user logs out
  useEffect(() => {
    if (!user && isInitialized) {
      setCurrentPage("timesheets");
    }
  }, [user, isInitialized]);

  const renderPage = () => {
    switch (currentPage) {
      case "timesheets":
        return <TimeSheetList />;

      case "users":
        return (
          <ProtectedRoute requiredRole="manager">
            <Users />
          </ProtectedRoute>
        );

      case "customers":
        return (
          <ProtectedRoute requiredRole="admin">
            <Customers />
          </ProtectedRoute>
        );

      case "process":
        return (
          <ProtectedRoute requiredRole="admin">
            <Process />
          </ProtectedRoute>
        );

      case "settings":
        return (
          <ProtectedRoute requiredRole="admin">
            <Settings />
          </ProtectedRoute>
        );

      default:
        return <TimeSheetList />;
    }
  };

  // Show minimal loading only during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show main app if authenticated
  return (
    <>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </>
  );
};

const App = () => {
  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>

      {/* Toast container - positioned globally */}
      <Toaster
        position={toastConfig.position}
        toastOptions={{
          duration: toastConfig.duration,
          style: toastConfig.style,
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        reverseOrder={false}
      />
    </>
  );
};

export default App;
