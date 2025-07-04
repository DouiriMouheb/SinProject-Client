// src/components/tickets/TicketTable.jsx -
import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ProfilePicture } from "../common/ProfilePicture";

// Enhanced helper functions for ticket-specific styling
const getPriorityColor = (priority) => {
  const colors = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusColor = (status) => {
  const colors = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    "in-progress": "bg-purple-100 text-purple-800 border-purple-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  const icons = {
    open: AlertCircle,
    "in-progress": Play,
    resolved: CheckCircle,
    closed: XCircle,
  };
  return icons[status] || AlertCircle;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `Today ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffInDays === 1) {
      return "Tomorrow";
    } else if (diffInDays > 1) {
      return `${diffInDays} days`;
    } else if (diffInDays === -1) {
      return "Yesterday";
    } else if (diffInDays < -1) {
      return `${Math.abs(diffInDays)} days ago`;
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

const formatTimeElapsed = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  } catch (error) {
    return "N/A";
  }
};

export const TicketTable = ({
  tickets = [],
  onView,
  onEdit,
  onDelete,
  onStatusUpdate,
  onAssign,

  canEdit = false,
  canDelete = false,
  canAssign = false,
  loading = false,
}) => {
  const { user } = useAuth();
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const handleStatusChange = async (ticket, newStatus) => {
    if (statusUpdating) return;

    setStatusUpdating(ticket.id || ticket._id);
    try {
      await onStatusUpdate(ticket.id || ticket._id, newStatus);
    } finally {
      setStatusUpdating(null);
    }
  };

  const canViewTicket = (ticket) => {
    return (
      user.role === "admin" ||
      (user.role === "manager" && ticket.department === user.department) ||
      ticket.createdBy?.id === user.id ||
      ticket.createdBy?._id === user.id ||
      ticket.assignedTo?.id === user.id ||
      ticket.assignedTo?._id === user.id
    );
  };

  const canEditTicket = (ticket) => {
    return (
      canEdit &&
      (user.role === "admin" ||
        (user.role === "manager" && ticket.department === user.department) ||
        ticket.createdBy?.id === user.id ||
        ticket.createdBy?._id === user.id)
    );
  };

  const canDeleteTicket = (ticket) => {
    return (
      canDelete &&
      (user.role === "admin" ||
        (user.role === "manager" && ticket.department === user.department))
    );
  };

  const toggleExpanded = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading tickets...</span>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tickets found
          </h3>
          <p className="mt-1 text-sm text-gray-500">Try creating a new one</p>
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
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => {
              const ticketId = ticket.id || ticket._id;
              const isExpanded = expandedTicket === ticketId;
              const StatusIcon = getStatusIcon(ticket.status);

              return (
                <React.Fragment key={ticketId}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${
                      isExpanded ? "bg-blue-50" : ""
                    } `}
                  >
                    {/* Ticket Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className="flex-shrink-0 cursor-pointer"
                          onClick={() => toggleExpanded(ticketId)}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                              onClick={() =>
                                canViewTicket(ticket) && onView(ticket)
                              }
                            >
                              {ticket.title}
                            </p>
                            {ticket.comments && ticket.comments.length > 0 && (
                              <div className="flex items-center text-gray-400">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                <span className="text-xs">
                                  {ticket.comments.length}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              {ticket.category}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ticket.department}
                            </p>
                            {ticket.dueDate && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due {formatDate(ticket.dueDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2" />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("-", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ticket.assignedTo ? (
                          <>
                            <ProfilePicture
                              user={ticket.assignedTo}
                              size="sm"
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-900">
                              {ticket.assignedTo.name || ticket.assignedTo}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <User className="h-4 w-4 mr-1" />
                            <span className="text-sm">Unassigned</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="max-w-4xl">
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {ticket.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Created by */}
                            <div>
                              <span className="font-medium text-gray-900">
                                Created by:
                              </span>
                              <div className="flex items-center mt-1">
                                <ProfilePicture
                                  user={ticket.createdBy}
                                  size="xs"
                                  className="mr-2"
                                />
                                <p className="text-gray-700">
                                  {ticket.createdBy?.name ||
                                    ticket.createdBy ||
                                    "Unknown"}
                                </p>
                              </div>
                            </div>

                            {ticket.estimatedHours && (
                              <div>
                                <span className="font-medium text-gray-900">
                                  Estimated Hours:
                                </span>
                                <p className="text-gray-700">
                                  {ticket.estimatedHours}h
                                </p>
                              </div>
                            )}

                            {ticket.tags && ticket.tags.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-900">
                                  Tags:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {ticket.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {ticket.resolution && (
                            <div className="mt-3 p-3 bg-green-50 rounded-md">
                              <h4 className="text-sm font-medium text-green-900 mb-1">
                                Resolution
                              </h4>
                              <p className="text-sm text-green-800">
                                {ticket.resolution.summary}
                              </p>
                              {ticket.resolution.resolvedBy && (
                                <div className="flex items-center mt-2">
                                  <ProfilePicture
                                    user={ticket.resolution.resolvedBy}
                                    size="xs"
                                    className="mr-2"
                                  />
                                  <p className="text-xs text-green-600">
                                    Resolved by{" "}
                                    {ticket.resolution.resolvedBy.name ||
                                      ticket.resolution.resolvedBy}
                                  </p>
                                </div>
                              )}
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
