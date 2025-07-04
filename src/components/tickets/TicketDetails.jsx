// src/components/tickets/TicketDetails.jsx - Fixed to use backend populated users
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  User,
  Tag,
  AlertCircle,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ProfilePicture } from "../common/ProfilePicture";
import { ticketService } from "../../services/tickets";
import { showToast } from "../../utils/toast";

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

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";

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

export const TicketDetails = ({
  ticketId,
  onBack,
  onEdit,
  onStatusUpdate,
  onTicketUpdate,
}) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showInternalComments, setShowInternalComments] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ticketService.getTicket(ticketId);

      if (response.success) {
        setTicket(response.data.ticket);
      }
    } catch (err) {
      console.error("Error loading ticket:", err);
      setError(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      showToast.error("Please enter a comment");
      return;
    }

    const loadingToastId = showToast.loading("Adding comment...");

    try {
      setSubmittingComment(true);

      const response = await ticketService.addComment(
        ticketId,
        newComment.trim(),
        isInternal
      );

      if (response.success) {
        // Backend returns the full updated ticket or just the new comment
        if (response.data.ticket) {
          setTicket(response.data.ticket);
        } else if (response.data.comment) {
          // Add the new comment to the existing ticket
          setTicket((prevTicket) => ({
            ...prevTicket,
            comments: [...(prevTicket.comments || []), response.data.comment],
            lastActivity:
              response.data.ticket?.lastActivity || new Date().toISOString(),
          }));
        }

        setNewComment("");
        setIsInternal(false);

        showToast.dismiss(loadingToastId);
        showToast.success("Comment added successfully");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      showToast.dismiss(loadingToastId);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (statusUpdating || !ticket) return;

    setStatusUpdating(true);
    const loadingToastId = showToast.loading(
      `Updating status to ${newStatus}...`
    );

    try {
      const response = await ticketService.updateTicketStatus(
        ticketId,
        newStatus
      );

      if (response.success) {
        setTicket(response.data.ticket);

        showToast.dismiss(loadingToastId);
        showToast.success(`Ticket status updated to ${newStatus}`);

        if (onStatusUpdate) {
          onStatusUpdate(ticketId, newStatus);
        }
        if (onTicketUpdate) {
          onTicketUpdate(response.data.ticket);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast.dismiss(loadingToastId);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Access control helpers
  const canEditTicket = () => {
    if (!ticket || !user) return false;

    return (
      hasRole("admin") ||
      (hasRole("manager") && ticket.department === user.department) ||
      ticket.createdBy?.id === user.id ||
      ticket.createdBy?._id === user.id
    );
  };

  const canChangeStatus = () => {
    if (!ticket || !user) return false;

    return (
      hasRole("manager") ||
      hasRole("admin") ||
      ticket.assignedTo?.id === user.id ||
      ticket.assignedTo?._id === user.id
    );
  };

  const canAddInternalComment = () => {
    return hasRole("manager") || hasRole("admin");
  };

  const canViewInternalComments = () => {
    if (!ticket || !user) return false;

    return (
      hasRole("admin") ||
      hasRole("manager") ||
      ticket.createdBy?.id === user.id ||
      ticket.createdBy?._id === user.id ||
      ticket.assignedTo?.id === user.id ||
      ticket.assignedTo?._id === user.id
    );
  };

  const filteredComments =
    ticket?.comments?.filter((comment) => {
      if (!comment.isInternal) return true;
      return canViewInternalComments() && showInternalComments;
    }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error Loading Ticket
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error || "Ticket not found"}
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {ticket.title}
              </h1>
              <p className="text-sm text-gray-500">
                Ticket #{String(ticketId).slice(-6)} • Created{" "}
                {formatDateTime(ticket.createdAt)}
              </p>
            </div>
          </div>

          {canEditTicket() && (
            <Button
              onClick={() => onEdit(ticket)}
              variant="secondary"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Description
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {ticket.tags && ticket.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Tags:
                  </span>
                  <div className="flex flex-wrap gap-2">
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
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Comments ({filteredComments.length})
              </h2>

              {canViewInternalComments() && (
                <Button
                  onClick={() => setShowInternalComments(!showInternalComments)}
                  variant="ghost"
                  size="sm"
                >
                  {showInternalComments ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Internal
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Internal
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={submittingComment}
                />

                <div className="flex items-center justify-between">
                  {canAddInternalComment() && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={submittingComment}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Internal comment
                      </span>
                    </label>
                  )}

                  <Button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    size="sm"
                  >
                    {submittingComment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Add Comment
                  </Button>
                </div>
              </div>
            </form>

            {/* Comments List - Now uses backend populated users directly */}
            <div className="space-y-4">
              {filteredComments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No comments yet.
                </p>
              ) : (
                filteredComments.map((comment, index) => {
                  // Backend now properly populates comment.user, so we can use it directly
                  const commentUser = comment.user;

                  return (
                    <div
                      key={comment._id || comment.id || index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Use the populated user directly from backend */}
                          <ProfilePicture
                            user={commentUser}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {commentUser?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(comment.createdAt)}
                            </p>
                          </div>
                        </div>

                        {comment.isInternal && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Internal
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Status & Actions
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status.replace("-", " ")}
                </span>
              </div>

              {canChangeStatus() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdating}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ticket Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Priority
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Category
                </span>
                <span className="text-sm text-gray-900">{ticket.category}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Department
                </span>
                <span className="text-sm text-gray-900">
                  {ticket.department}
                </span>
              </div>

              {ticket.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Due Date
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDateTime(ticket.dueDate)}
                  </span>
                </div>
              )}

              {ticket.estimatedHours && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Estimated Hours
                  </span>
                  <span className="text-sm text-gray-900">
                    {ticket.estimatedHours}h
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* People */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">People</h3>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Created by
                </span>
                <div className="mt-1 flex items-center space-x-2">
                  <ProfilePicture
                    user={ticket.createdBy}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <span className="text-sm text-gray-900">
                    {ticket.createdBy?.name || "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  Assigned to
                </span>
                <div className="mt-1">
                  {ticket.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      <ProfilePicture
                        user={ticket.assignedTo}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <span className="text-sm text-gray-900">
                        {ticket.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resolution */}
          {ticket.resolution && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resolution
              </h3>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  {ticket.resolution.summary}
                </p>

                {ticket.resolution.resolvedBy && (
                  <div className="flex items-center space-x-2">
                    <ProfilePicture
                      user={ticket.resolution.resolvedBy}
                      size="xs"
                      className="flex-shrink-0"
                    />
                    <div className="text-xs text-gray-500">
                      Resolved by {ticket.resolution.resolvedBy.name}
                      {ticket.resolution.resolvedAt && (
                        <> on {formatDateTime(ticket.resolution.resolvedAt)}</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
