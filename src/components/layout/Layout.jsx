// src/components/layout/Layout.jsx - Updated with UserProfileModal
import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { UserProfileModal } from "../users/UserProfileModal";

export const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    // Close mobile sidebar when opening profile on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            isMobile
              ? sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : sidebarOpen
              ? "w-64"
              : "w-16"
          } fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex-shrink-0`}
        >
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
            onCloseMobile={() => isMobile && setSidebarOpen(false)}
            onOpenProfile={handleOpenProfile}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white shadow-sm z-30 flex-shrink-0">
            <div className="flex items-center px-4 py-3">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
              >
                <Menu className="h-6 w-6" />
              </button>

              <h2 className="ml-4 text-lg font-semibold text-gray-800 truncate">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto bg-gray-50 p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
      />
    </>
  );
};
