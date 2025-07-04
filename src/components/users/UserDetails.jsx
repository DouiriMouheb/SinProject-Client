// src/components/users/UserDetails.jsx - Fixed to use proper confirmation modal
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Activity,
  LogIn,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { userService } from "../../services/users";
import { showToast } from "../../utils/toast";
import { ProfilePicture } from "../common/ProfilePicture"; // ADDED: Import ProfilePicture

const getRoleColor = (role) => {
  const colors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    manager: "bg-blue-100 text-blue-800 border-blue-200",
    user: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return formatDateTime(dateString);
    }
  } catch (error) {
    return "Invalid date";
  }
};

export const UserDetails = ({
  userId,
  onBack,
  onEdit,
  onStatusToggle,
  onResetPassword,
  onChangeRole,
  onDelete,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // FIXED: Added state for confirmation modals instead of window.confirm()
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { user: currentUser, hasRole } = useAuth();

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getUser(userId);

      if (response.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error("Error loading user:", err);
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Updated to use modal instead of window.confirm()
  const handleStatusToggleRequest = () => {
    setShowStatusModal(true);
  };

  const confirmStatusToggle = async () => {
    if (!user || actionLoading) return;

    setActionLoading("status");

    try {
      const newStatus = !user.isActive;
      await onStatusToggle(userId, newStatus);

      // Update local state
      setUser((prev) => ({ ...prev, isActive: newStatus }));

      showToast.success(
        `User ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setActionLoading(null);
      setShowStatusModal(false);
    }
  };

  // Access control checks
  const isCurrentUser = userId === currentUser.id || userId === currentUser._id;
  const canEdit = () => {
    return (
      hasRole("admin") ||
      (hasRole("manager") && user?.department === currentUser.department)
    );
  };
  const canToggleStatus = () => !isCurrentUser && canEdit();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error Loading User
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error || "User not found"}
        </p>
        <div className="mt-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isAccountLocked =
    user.lockUntil && new Date(user.lockUntil) > new Date();

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4">
            {/* Back button and user info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={onBack} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Users</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    {/* FIXED: Use ProfilePicture instead of simple div */}
                    <ProfilePicture
                      user={user}
                      size="lg"
                      className="mr-3 flex-shrink-0"
                    />
                    {user.name}
                    {isCurrentUser && (
                      <span className="ml-3 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Edit button - moved below name and responsive */}
            {canEdit() && (
              <div className="flex justify-start">
                <Button
                  onClick={() => onEdit(user)}
                  variant="secondary"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h2>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Email Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {user.email}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                        user.role
                      )}`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Account Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Account Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    {user.isActive ? (
                      <UserCheck className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <UserX className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Account Status
                      </p>
                      <p
                        className={`text-sm ${
                          user.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  {canToggleStatus() && (
                    <Button
                      onClick={handleStatusToggleRequest}
                      variant={user.isActive ? "danger" : "primary"}
                      size="sm"
                      disabled={actionLoading === "status"}
                    >
                      {actionLoading === "status" ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : user.isActive ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  )}
                </div>

                {isAccountLocked && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Account Locked
                        </p>
                        <p className="text-sm text-red-700">
                          Locked until {formatDateTime(user.lockUntil)} due to
                          multiple failed login attempts
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center">
                      <LogIn className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Last Login</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatRelativeTime(user.lastLogin)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Failed Attempts</p>
                        <p className="text-sm font-medium text-gray-900">
                          {user.loginAttempts || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Timeline */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Account Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Created
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Last Login
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Added confirmation modals instead of window.confirm() */}

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={confirmStatusToggle}
        title={`${user.isActive ? "Deactivate" : "Activate"} User`}
        message={`Are you sure you want to ${
          user.isActive ? "deactivate" : "activate"
        } ${user.name}'s account?`}
        confirmText={user.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        type={user.isActive ? "warning" : "info"}
        isLoading={actionLoading === "status"}
        itemName={`${user.name} (${user.email})`}
        details={
          user.isActive
            ? [
                "User will not be able to log in",
                "User will be logged out of all active sessions",
                "User can be reactivated later",
              ]
            : [
                "User will be able to log in again",
                "User will regain access to their account",
                "User will need to log in with their existing credentials",
              ]
        }
      />
    </>
  );
};
