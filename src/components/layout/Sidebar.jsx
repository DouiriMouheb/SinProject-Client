import {
  Home,
  CheckSquare,
  Ticket,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Hourglass,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ProfilePicture } from "../common/ProfilePicture";

export const Sidebar = ({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  isMobile,
  onCloseMobile,
  onOpenProfile,
}) => {
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    /*{ name: "Dashboard", icon: Home, page: "dashboard" },
    { name: "Tickets", icon: Ticket, page: "tickets" },*/
    { name: "TimeSheets", icon: Hourglass, page: "timesheets" },

    ...(hasRole("manager")
      ? [{ name: "Users", icon: Users, page: "users" }]
      : []),
    ...(hasRole("admin")
      ? [{ name: "Settings", icon: Settings, page: "settings" }]
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
      className={`flex flex-col h-full bg-white shadow-lg overflow-x-hidden ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300`}
    >
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } h-16 px-4 bg-blue-600`}
      >
        {isOpen ? (
          <>
            <h1 className="text-xl font-bold text-white">Company Portal</h1>
            {isMobile && (
              <button
                onClick={onCloseMobile}
                className="text-white hover:text-gray-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
          </>
        ) : (
          <div className="text-white font-bold text-xl">CP</div>
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
                ? "bg-blue-100 text-blue-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title={!isOpen ? item.name : ""}
          >
            <item.icon
              className={`${isOpen ? "mr-3" : ""} h-5 w-5 flex-shrink-0`}
            />
            {isOpen && <span>{item.name}</span>}

            {/* Tooltip for collapsed state */}
            {!isOpen && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Updated Profile Section with ProfilePicture component */}
      <div className={`border-t ${isOpen ? "p-4" : "p-2"}`}>
        <div
          className={`flex items-center ${
            !isOpen ? "justify-center" : ""
          } mb-2 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors group relative`}
          onClick={handleProfileClick}
          title={!isOpen ? "My Profile" : ""}
        >
          {/* Use ProfilePicture component instead of simple div */}
          <ProfilePicture user={user} size="sm" className="flex-shrink-0" />

          {isOpen && (
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}

          {/* Tooltip for collapsed state */}
          {!isOpen && !isMobile && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              My Profile
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center ${
            isOpen ? "px-2" : "justify-center"
          } py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group relative`}
          title={!isOpen ? "Sign out" : ""}
        >
          <LogOut className={`${isOpen ? "mr-3" : ""} h-4 w-4 flex-shrink-0`} />
          {isOpen && <span>Sign out</span>}

          {/* Tooltip for collapsed state */}
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
