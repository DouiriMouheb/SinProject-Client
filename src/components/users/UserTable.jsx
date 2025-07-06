// src/components/users/UserTable.jsx - Complete version with ProfilePicture integration
import React, { useState } from "react";
import {
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Shield,
  Mail,
  Calendar,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ProfilePicture } from "../common/ProfilePicture";

const getRoleColor = (role) => {
  const colors = {
    admin:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700",
    manager:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    user: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700",
  };
  return (
    colors[role] ||
    "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600"
  );
};

const getDepartmentColor = (department) => {
  const colors = {
    IT: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    HR: "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300",
    Finance:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    Operations:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    Marketing:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    Sales:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    Legal:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300",
    Executive:
      "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300",
  };
  return (
    colors[department] ||
    "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  } catch (error) {
    return "Invalid date";
  }
};

export const UserTable = ({
  users = [],
  onView,
  onChangeRole,
  canEdit = () => false,
  canDelete = false,
  userRole = "user",
  userDepartment = "",
  loading = false,
}) => {
  const { user: currentUser } = useAuth();
  const [expandedUser, setExpandedUser] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const canViewUser = (targetUser) => {
    return (
      userRole === "admin" ||
      (userRole === "manager" && targetUser.department === userDepartment) ||
      targetUser.id === currentUser.id ||
      targetUser._id === currentUser.id
    );
  };

  const toggleExpanded = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
    setActionMenuOpen(null); // Close any open action menus
  };

  const toggleActionMenu = (userId, event) => {
    event.stopPropagation();
    setActionMenuOpen(actionMenuOpen === userId ? null : userId);
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">
            Loading users...
          </span>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            No users found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your filters or create a new user
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Department
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-50 dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => {
              const userId = user.id || user._id;
              const isExpanded = expandedUser === userId;
              const isCurrentUser =
                userId === currentUser.id || userId === currentUser._id;

              return (
                <React.Fragment key={userId}>
                  <tr
                    className={`hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                      isExpanded ? "bg-blue-50 dark:bg-blue-900/30" : ""
                    } ${
                      isCurrentUser ? "bg-yellow-50 dark:bg-yellow-900/30" : ""
                    }`}
                    onClick={() => toggleExpanded(userId)}
                  >
                    {/* User Info with ProfilePicture - Enhanced for mobile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ProfilePicture
                            user={user}
                            size="md"
                            className={`${
                              !user.isActive ? "opacity-50 grayscale" : ""
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600 font-semibold">
                                  (You)
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          {/* Show role and status on mobile only */}
                          <div className="md:hidden mt-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                                  user.role
                                )}`}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role}
                              </span>
                              {user.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(
                                  user.department
                                )}`}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                {user.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role - Hidden on mobile */}
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    </td>

                    {/* Department - Hidden on mobile */}
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(
                          user.department
                        )}`}
                      >
                        <Building2 className="h-3 w-3 mr-1" />
                        {user.department}
                      </span>
                    </td>

                    {/* Status - Hidden on mobile */}
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Last Login - Hidden on mobile */}
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canViewUser(user) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(user);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td
                        colSpan="6"
                        className="hidden lg:table-cell px-6 py-4"
                      >
                        <div className="max-w-4xl">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">
                                Account Created:
                              </span>
                              <p className="text-gray-700">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Last Updated:
                              </span>
                              <p className="text-gray-700">
                                {formatDate(user.updatedAt)}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Account Status:
                              </span>
                              <p
                                className={`font-medium ${
                                  user.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Login Attempts:
                              </span>
                              <p className="text-gray-700">
                                {user.loginAttempts || 0} failed attempts
                              </p>
                            </div>

                            {user.lockUntil &&
                              new Date(user.lockUntil) > new Date() && (
                                <div className="md:col-span-2">
                                  <span className="font-medium text-red-900">
                                    Account Locked Until:
                                  </span>
                                  <p className="text-red-700">
                                    {new Date(user.lockUntil).toLocaleString()}
                                  </p>
                                </div>
                              )}

                            {/* Display profile picture info if available */}
                            {user.displayPicture && (
                              <div>
                                <span className="font-medium text-gray-900">
                                  Profile Picture:
                                </span>
                                <p className="text-gray-700">
                                  {user.displayPicture.type === "image"
                                    ? "Custom image uploaded"
                                    : "Using initials"}
                                </p>
                              </div>
                            )}
                          </div>

                          {isCurrentUser && (
                            <div className="mt-3 p-3 bg-blue-100 rounded-md">
                              <p className="text-sm text-blue-800">
                                💡 This is your account. Some management actions
                                are not available for your own account for
                                security reasons.
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Mobile expanded view */}
                      <td colSpan="2" className="lg:hidden px-6 py-4">
                        <div className="space-y-3">
                          {/* Last Login */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Last Login
                            </h4>
                            <div className="flex items-center text-sm text-gray-700">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(user.lastLogin)}
                            </div>
                          </div>

                          {/* Account Info */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Account Info
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>Created: {formatDate(user.createdAt)}</p>
                              <p>Updated: {formatDate(user.updatedAt)}</p>
                              <p>Failed logins: {user.loginAttempts || 0}</p>
                            </div>
                          </div>

                          {user.lockUntil &&
                            new Date(user.lockUntil) > new Date() && (
                              <div>
                                <h4 className="text-sm font-medium text-red-900 mb-1">
                                  Account Locked
                                </h4>
                                <p className="text-sm text-red-700">
                                  Until:{" "}
                                  {new Date(user.lockUntil).toLocaleString()}
                                </p>
                              </div>
                            )}

                          {isCurrentUser && (
                            <div className="p-3 bg-blue-100 rounded-md">
                              <p className="text-sm text-blue-800">
                                💡 This is your account. Some management actions
                                are not available for your own account for
                                security reasons.
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
};
