// src/components/tickets/TicketModal.jsx - Updated with ProfilePicture integration
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { ProfilePicture } from "../common/ProfilePicture";
import { showToast } from "../../utils/toast";
import { userService } from "../../services/users";
import { Calendar, User, Tag, Clock, Search, ChevronDown } from "lucide-react";

export const TicketModal = ({
  isOpen,
  onClose,
  ticket,
  onChange,
  onSave,
  mode,
  userRole = "user",
  userDepartment = "",
}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User assignment states
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isReadOnly = mode === "view";
  const isCreating = mode === "create";
  const isEditing = mode === "edit";

  const title =
    {
      create: "Create New Ticket",
      edit: "Edit Ticket",
      view: "View Ticket",
    }[mode] || "Ticket";

  // Reset errors when modal opens/closes or mode changes
  useEffect(() => {
    setErrors({});
    setIsSubmitting(false);
    setUserSearch("");
  }, [isOpen, mode]);

  // Fetch users when department changes
  useEffect(() => {
    if (
      ticket?.department &&
      (userRole === "manager" || userRole === "admin")
    ) {
      fetchDepartmentUsers(ticket.department);
    }
  }, [ticket?.department, userRole]);

  // Fetch users for the selected department
  const fetchDepartmentUsers = async (department) => {
    if (!department) {
      setDepartmentUsers([]);
      return;
    }

    try {
      setUsersLoading(true);

      const response = await userService.getUsers({
        department: department,
        isActive: "true",
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      });

      if (response.success) {
        setDepartmentUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching department users:", error);
      showToast.error("Failed to load users for assignment");
      setDepartmentUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = departmentUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Get currently assigned user details
  const getAssignedUserName = () => {
    if (!ticket?.assignedTo) return "Unassigned";

    const assignedUser = departmentUsers.find(
      (user) => (user.id || user._id) === ticket.assignedTo
    );

    if (assignedUser) {
      return assignedUser.name;
    }

    if (ticket.assignedTo && typeof ticket.assignedTo === "object") {
      return `${ticket.assignedTo.name} (Different Department)`;
    }

    return "Unknown User";
  };

  // Get currently assigned user object for ProfilePicture
  const getAssignedUser = () => {
    if (!ticket?.assignedTo) return null;

    const assignedUser = departmentUsers.find(
      (user) => (user.id || user._id) === ticket.assignedTo
    );

    if (assignedUser) {
      return assignedUser;
    }

    // If assigned user is an object but not in department users
    if (ticket.assignedTo && typeof ticket.assignedTo === "object") {
      return ticket.assignedTo;
    }

    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!ticket?.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (ticket.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (ticket.title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (!ticket?.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (ticket.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!ticket?.category) {
      newErrors.category = "Category is required";
    }

    if (!ticket?.department) {
      newErrors.department = "Department is required";
    }

    if (!ticket?.priority) {
      newErrors.priority = "Priority is required";
    }

    if (ticket?.dueDate) {
      const dueDate = new Date(ticket.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        newErrors.dueDate = "Due date must be in the future";
      }
    }

    if (ticket?.estimatedHours !== undefined && ticket?.estimatedHours !== "") {
      const hours = parseFloat(ticket.estimatedHours);
      if (isNaN(hours) || hours < 0) {
        newErrors.estimatedHours = "Estimated hours must be a positive number";
      } else if (hours > 1000) {
        newErrors.estimatedHours = "Estimated hours cannot exceed 1000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReadOnly || isSubmitting) return;

    if (!validateForm()) {
      showToast.error("Please fix the errors below and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        title: ticket.title.trim(),
        description: ticket.description.trim(),
        priority: ticket.priority,
        category: ticket.category,
        department: ticket.department,
        tags: ticket.tags || [],
      };

      if (ticket.dueDate) {
        submitData.dueDate = ticket.dueDate;
      }

      if (ticket.estimatedHours !== undefined && ticket.estimatedHours !== "") {
        submitData.estimatedHours = parseFloat(ticket.estimatedHours);
      }

      if (
        (userRole === "manager" || userRole === "admin") &&
        ticket.assignedTo
      ) {
        submitData.assignedTo = ticket.assignedTo;
      }

      await onSave(submitData);
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    onChange({ ...ticket, [field]: value });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "department" && ticket?.assignedTo) {
      onChange({ ...ticket, [field]: value, assignedTo: "" });
    }
  };

  const handleUserSelect = (userId) => {
    handleInputChange("assignedTo", userId);
    setShowUserDropdown(false);
    setUserSearch("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowUserDropdown(false);
        onClose();
      }}
      title={title}
      footer={
        !isReadOnly && (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUserDropdown(false);
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isCreating ? "Creating..." : "Saving..."}
                </div>
              ) : isCreating ? (
                "Create Ticket"
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Basic Information */}
        <div className="space-y-4">
          <Input
            label="Title"
            type="text"
            value={ticket?.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.title}
            placeholder="Enter a descriptive title for the ticket"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={ticket?.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.description
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } disabled:bg-gray-100`}
              placeholder="Provide a detailed description of the issue or request"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Priority and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={ticket?.priority || "medium"}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              disabled={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.priority ? "border-red-300" : "border-gray-300"
              } disabled:bg-gray-100`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={ticket?.category || "general"}
              onChange={(e) => handleInputChange("category", e.target.value)}
              disabled={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? "border-red-300" : "border-gray-300"
              } disabled:bg-gray-100`}
            >
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="hr">HR</option>
              <option value="facilities">Facilities</option>
              <option value="equipment">Equipment</option>
              <option value="software">Software</option>
              <option value="access">Access</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Department and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              value={ticket?.department || userDepartment}
              onChange={(e) => handleInputChange("department", e.target.value)}
              disabled={isReadOnly || (userRole === "user" && isCreating)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.department ? "border-red-300" : "border-gray-300"
              } disabled:bg-gray-100`}
            >
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Legal">Legal</option>
              <option value="Executive">Executive</option>
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          {!isCreating && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={ticket?.status || "open"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                disabled={isReadOnly || userRole === "user"}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        {/* User Assignment - UPDATED with ProfilePicture */}
        {(userRole === "manager" || userRole === "admin") && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>

            {/* Current assignment display / dropdown trigger */}
            <div
              onClick={() =>
                !isReadOnly && setShowUserDropdown(!showUserDropdown)
              }
              className={`block w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer transition-colors ${
                isReadOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-white hover:border-blue-300"
              } border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getAssignedUser() ? (
                    <>
                      <ProfilePicture
                        user={getAssignedUser()}
                        size="xs"
                        className="mr-2"
                      />
                      <span className="text-gray-900">
                        {getAssignedUserName()}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Unassigned</span>
                    </>
                  )}
                </div>
                {!isReadOnly && (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Dropdown menu */}
            {showUserDropdown && !isReadOnly && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {/* Search input */}
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Loading state */}
                {usersLoading && (
                  <div className="p-3 text-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    <span className="text-sm text-gray-500 mt-1">
                      Loading users...
                    </span>
                  </div>
                )}

                {/* User options */}
                {!usersLoading && (
                  <>
                    {/* Unassigned option */}
                    <div
                      onClick={() => handleUserSelect("")}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    >
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Unassigned</span>
                    </div>

                    {/* Department users - UPDATED with ProfilePicture */}
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id || user._id}
                          onClick={() => handleUserSelect(user.id || user._id)}
                          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                            (user.id || user._id) === ticket?.assignedTo
                              ? "bg-blue-50 text-blue-900"
                              : ""
                          }`}
                        >
                          <ProfilePicture
                            user={user}
                            size="xs"
                            className="mr-2 flex-shrink-0"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.role} • {user.email}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : userSearch ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No users found matching "{userSearch}"
                      </div>
                    ) : departmentUsers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No users available in {ticket?.department} department
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}

            {/* Department info */}
            {ticket?.department &&
              (userRole === "manager" || userRole === "admin") && (
                <p className="mt-1 text-xs text-gray-500">
                  Showing users from {ticket.department} department
                  {departmentUsers.length > 0 &&
                    ` (${departmentUsers.length} available)`}
                </p>
              )}
          </div>
        )}

        {/* Optional Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formatDate(ticket?.dueDate)}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            disabled={isReadOnly}
            error={errors.dueDate}
            icon={Calendar}
          />

          <Input
            label="Estimated Hours"
            type="number"
            step="0.5"
            min="0"
            max="1000"
            value={ticket?.estimatedHours || ""}
            onChange={(e) =>
              handleInputChange("estimatedHours", e.target.value)
            }
            disabled={isReadOnly}
            error={errors.estimatedHours}
            placeholder="0.0"
            icon={Clock}
          />
        </div>

        {/* Tags */}
        <Input
          label="Tags (comma-separated)"
          type="text"
          value={
            Array.isArray(ticket?.tags)
              ? ticket.tags.join(", ")
              : ticket?.tags || ""
          }
          onChange={(e) => {
            const tagsString = e.target.value;
            const tagsArray = tagsString
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag);
            handleInputChange("tags", tagsArray);
          }}
          disabled={isReadOnly}
          placeholder="bug, feature, urgent"
          icon={Tag}
        />

        {/* Read-only fields for existing tickets */}
        {!isCreating && ticket && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Ticket Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">
                  {formatDateTime(ticket.createdAt)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium">
                  {formatDateTime(ticket.lastActivity || ticket.updatedAt)}
                </p>
              </div>
              {ticket.createdBy && (
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <div className="flex items-center mt-1">
                    <ProfilePicture
                      user={ticket.createdBy}
                      size="xs"
                      className="mr-2"
                    />
                    <p className="font-medium">
                      {ticket.createdBy.name || ticket.createdBy}
                    </p>
                  </div>
                </div>
              )}
              {ticket.assignedTo && (
                <div>
                  <span className="text-gray-500">Assigned To:</span>
                  <div className="flex items-center mt-1">
                    <ProfilePicture
                      user={getAssignedUser()}
                      size="xs"
                      className="mr-2"
                    />
                    <p className="font-medium">{getAssignedUserName()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
