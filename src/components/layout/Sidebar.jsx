import {
  Home,
  CheckSquare,
  Ticket,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Hourglass,
  Building2, // For Customers
  Workflow, // For Process
  Menu, // For toggle button
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ProfilePicture } from "../common/ProfilePicture";
import { DailyLoginTracker } from "../common/DailyLoginTracker";
import { ThemeToggle } from "../common/ThemeToggle";

export const Sidebar = ({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  toggleSidebar,
  isMobile,
  onCloseMobile,
  onOpenProfile,
}) => {
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: "TimeSheets", icon: Hourglass, page: "timesheets" },

    // Manager-level access
    ...(hasRole("manager")
      ? [{ name: "Users", icon: Users, page: "users" }]
      : []),

    // Admin-only access
    ...(hasRole("admin")
      ? [
          { name: "Customers", icon: Building2, page: "customers" },
          { name: "Process", icon: Workflow, page: "process" },
          { name: "Settings", icon: Settings, page: "settings" },
        ]
      : []),
  ];

  const handleNavClick = (page) => {
    setCurrentPage(page);
    onCloseMobile();
  };

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  const isOpen = sidebarOpen || isMobile;

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg overflow-x-hidden ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300`}
    >
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } h-16 px-4 bg-blue-600 dark:bg-blue-700`}
      >
        {isOpen ? (
          <>
            <h1 className="text-xl font-bold text-white">Company Portal</h1>
            <div className="flex items-center space-x-2">
              {/* Toggle button for desktop */}
              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="text-white hover:text-gray-200 p-1 rounded transition-colors"
                  title="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              {/* Close button for mobile */}
              {isMobile && (
                <button
                  onClick={onCloseMobile}
                  className="text-white hover:text-gray-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-200 p-2 rounded transition-colors"
            title="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavClick(item.page)}
            className={`w-full flex items-center ${
              isOpen ? "px-2" : "px-3 justify-center"
            } py-2 text-sm font-medium rounded-md transition-colors group relative ${
              currentPage === item.page
                ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            title={!isOpen ? item.name : ""}
          >
            <item.icon
              className={`${isOpen ? "mr-3" : ""} h-5 w-5 flex-shrink-0`}
            />
            {isOpen && <span>{item.name}</span>}

            {/* Tooltip for collapsed state */}
            {!isOpen && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Profile Section */}
      <div
        className={`border-t dark:border-gray-700 ${isOpen ? "p-4" : "p-2"}`}
      >
        <div
          className={`flex items-center ${
            !isOpen ? "justify-center" : ""
          } mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md p-2 transition-colors group relative`}
          onClick={handleProfileClick}
          title={!isOpen ? "My Profile" : ""}
        >
          <ProfilePicture user={user} size="sm" className="flex-shrink-0" />

          {isOpen && (
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          )}

          {!isOpen && !isMobile && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              My Profile
            </div>
          )}
        </div>

        {/* Daily Login Tracker - only show when sidebar is open */}
        {isOpen && (
          <div className="mb-3">
            <DailyLoginTracker
              variant="compact"
              className="text-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-2"
            />
          </div>
        )}

        {/* Theme Toggle */}
        <div
          className={`flex items-center ${
            !isOpen ? "justify-center" : ""
          } mb-2`}
        >
          {isOpen ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Theme
              </span>
              <ThemeToggle />
            </div>
          ) : (
            <ThemeToggle />
          )}
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center ${
            isOpen ? "px-2" : "justify-center"
          } py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group relative`}
          title={!isOpen ? "Sign out" : ""}
        >
          <LogOut className={`${isOpen ? "mr-3" : ""} h-4 w-4 flex-shrink-0`} />
          {isOpen && <span>Sign out</span>}

          {!isOpen && !isMobile && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Sign out
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
