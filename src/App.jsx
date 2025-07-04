import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./components/auth/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { TimeSheetList } from "./components/Timesheets/TimeSheetList";
import { Users } from "./components/users/Users";
import { Settings } from "./components/settings/Settings";
import { toastConfig } from "./utils/toast";

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("timesheets"); // Default to Timesheet page
  const { user, isInitialized } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case "timesheets": // ADD: Timesheet page
        return <TimeSheetList />;

      case "users":
        return (
          <ProtectedRoute requiredRole="manager">
            <Users />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Initializing...</p>
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>

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
