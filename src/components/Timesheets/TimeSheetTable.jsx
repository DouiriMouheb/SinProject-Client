// src/components/Timesheets/TimeSheetTable.jsx - Time entries display
import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Play,
  Pause,
  Square,
  AlertCircle,
  Briefcase,
  User,
} from "lucide-react";
import { Button } from "../common/Button";
import { ProfilePicture } from "../common/ProfilePicture";

const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800 border-green-200",
    paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  const icons = {
    active: Play,
    paused: Pause,
    completed: Square,
  };
  return icons[status] || Square;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  } catch (error) {
    return "Invalid date";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "N/A";
  }
};

const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

export const TimeSheetTable = ({
  timeEntries = [],
  onView,
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,
  loading = false,
  showUser = false, // For admin/manager views
}) => {
  const [expandedEntry, setExpandedEntry] = useState(null);

  const toggleExpanded = (entryId) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading time entries...</span>
        </div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No time entries found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start tracking your time or adjust your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task & Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {showUser && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeEntries.map((entry) => {
              const entryId = entry.id || entry._id;
              const isExpanded = expandedEntry === entryId;
              const StatusIcon = getStatusIcon(entry.status);

              return (
                <React.Fragment key={entryId}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      isExpanded ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleExpanded(entryId)}
                  >
                    {/* Task & Project */}
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.taskName}
                            </p>
                            {entry.isManual && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Manual
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Briefcase className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {entry.workProject?.name || "Unknown Project"}
                              </span>
                              {entry.workProject?.customer?.name && (
                                <span className="ml-1 truncate">
                                  ({entry.workProject.customer.name})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="truncate">
                                {entry.activity?.name || "Unknown Activity"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(entry.startTime)}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(entry.startTime)} -{" "}
                          {formatTime(entry.endTime)}
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {formatDuration(entry.durationMinutes)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2" />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            entry.status
                          )}`}
                        >
                          {entry.status === "completed"
                            ? "Completed"
                            : entry.status === "active"
                            ? "Active"
                            : "Paused"}
                        </span>
                      </div>
                    </td>

                    {/* User (for admin/manager views) */}
                    {showUser && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ProfilePicture
                            user={entry.user}
                            size="sm"
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900">
                            {entry.user?.name || "Unknown User"}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(entry);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canEdit(entry) && entry.status === "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(entry);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Edit entry"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}

                        {canDelete(entry) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(entryId);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td colSpan={showUser ? 6 : 5} className="px-6 py-4">
                        <div className="max-w-4xl">
                          {/* Description */}
                          {entry.description && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {entry.description}
                              </p>
                            </div>
                          )}

                          {/* Additional Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">
                                Created:
                              </span>
                              <p className="text-gray-700">
                                {entry.createdAt
                                  ? new Date(entry.createdAt).toLocaleString()
                                  : "N/A"}
                              </p>
                            </div>

                            {entry.endTime && (
                              <div>
                                <span className="font-medium text-gray-900">
                                  Completed:
                                </span>
                                <p className="text-gray-700">
                                  {new Date(entry.endTime).toLocaleString()}
                                </p>
                              </div>
                            )}

                            <div>
                              <span className="font-medium text-gray-900">
                                Type:
                              </span>
                              <p
                                className={`font-medium ${
                                  entry.isManual
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {entry.isManual
                                  ? "Manual Entry"
                                  : "Timer Entry"}
                              </p>
                            </div>

                            {entry.workProject?.description && (
                              <div className="md:col-span-3">
                                <span className="font-medium text-gray-900">
                                  Project Description:
                                </span>
                                <p className="text-gray-700 mt-1">
                                  {entry.workProject.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Entry Type Info */}
                          {entry.status !== "completed" && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                                <div className="text-sm text-yellow-700">
                                  <p className="font-medium">Active Entry</p>
                                  <p>
                                    This entry is currently {entry.status}.
                                    {entry.status === "active"
                                      ? " Time is being tracked."
                                      : " Timer is paused."}
                                  </p>
                                </div>
                              </div>
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
    </div>
  );
};
