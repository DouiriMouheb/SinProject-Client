// src/components/Timesheets/TimeSheetModal.jsx - Manual entry creation/editing
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { Calendar, Clock, Briefcase, Activity } from "lucide-react";

export const TimeSheetModal = ({
  isOpen,
  onClose,
  timeEntry,
  onChange,
  onSave,
  mode,
  projects = [],
  activities = [],
}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const isReadOnly = mode === "view";
  const isCreating = mode === "create";
  const isEditing = mode === "edit";

  const title =
    {
      create: "Add Manual Time Entry",
      edit: "Edit Time Entry",
      view: "View Time Entry",
    }[mode] || "Time Entry";

  // Reset errors and update filtered activities when modal opens/closes or project changes
  useEffect(() => {
    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, mode]);

  useEffect(() => {
    if (timeEntry?.workProjectId) {
      const project = projects.find((p) => p.id === timeEntry.workProjectId);
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  }, [timeEntry?.workProjectId, projects]);

  useEffect(() => {
    // Filter activities based on selected project if needed
    // For now, show all activities since we don't have project-activity mapping
    setFilteredActivities(activities);
  }, [activities, selectedProject]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!timeEntry?.taskName?.trim()) {
      newErrors.taskName = "Task name is required";
    } else if (timeEntry.taskName.trim().length < 2) {
      newErrors.taskName = "Task name must be at least 2 characters";
    }

    if (!timeEntry?.workProjectId) {
      newErrors.workProjectId = "Project is required";
    }

    if (!timeEntry?.activityId) {
      newErrors.activityId = "Activity is required";
    }

    if (!timeEntry?.date) {
      newErrors.date = "Date is required";
    }

    // Time validation
    if (!timeEntry?.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!timeEntry?.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Cross-field validation
    if (timeEntry?.startTime && timeEntry?.endTime) {
      const start = new Date(`${timeEntry.date}T${timeEntry.startTime}`);
      const end = new Date(`${timeEntry.date}T${timeEntry.endTime}`);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }

      // Check for reasonable duration (not more than 24 hours)
      const diffHours = (end - start) / (1000 * 60 * 60);
      if (diffHours > 24) {
        newErrors.endTime = "Duration cannot exceed 24 hours";
      }
    }

    // Future date validation
    if (timeEntry?.date) {
      const entryDate = new Date(timeEntry.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (entryDate > today) {
        newErrors.date = "Cannot create time entries for future dates";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = () => {
    if (!timeEntry?.startTime || !timeEntry?.endTime || !timeEntry?.date) {
      return 0;
    }

    try {
      const start = new Date(`${timeEntry.date}T${timeEntry.startTime}`);
      const end = new Date(`${timeEntry.date}T${timeEntry.endTime}`);
      const diffMinutes = Math.max(0, (end - start) / (1000 * 60));
      return Math.round(diffMinutes);
    } catch (error) {
      return 0;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "0 minutes";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? "s" : ""}`;
    } else if (mins === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      return `${hours}h ${mins}m`;
    }
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
      // Prepare data for submission
      const submitData = {
        taskName: timeEntry.taskName.trim(),
        description: timeEntry.description?.trim() || "",
        workProjectId: timeEntry.workProjectId,
        activityId: timeEntry.activityId,
        date: timeEntry.date,
        startTime: timeEntry.startTime,
        endTime: timeEntry.endTime,
        isManual: true,
      };

      // Calculate duration
      const durationMinutes = calculateDuration();
      submitData.durationMinutes = durationMinutes;

      // For backend compatibility, convert to datetime strings
      submitData.startTime = new Date(
        `${timeEntry.date}T${timeEntry.startTime}`
      ).toISOString();
      submitData.endTime = new Date(
        `${timeEntry.date}T${timeEntry.endTime}`
      ).toISOString();

      await onSave(submitData);
    } catch (error) {
      console.error("Error submitting time entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    onChange({ ...timeEntry, [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProjectChange = (projectId) => {
    // Clear activity when project changes
    onChange({
      ...timeEntry,
      workProjectId: projectId,
      activityId: "",
    });

    // Clear errors
    if (errors.workProjectId) {
      setErrors((prev) => ({ ...prev, workProjectId: "", activityId: "" }));
    }
  };

  const duration = calculateDuration();

  // Get current date for default
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        !isReadOnly && (
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isCreating ? "Creating..." : "Saving..."}
                </div>
              ) : isCreating ? (
                "Create Entry"
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Task Information */}
        <div className="space-y-4">
          <Input
            label="Task Name"
            type="text"
            value={timeEntry?.taskName || ""}
            onChange={(e) => handleInputChange("taskName", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.taskName}
            placeholder="What did you work on?"
            icon={Briefcase}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={timeEntry?.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add more details about what you worked on..."
            />
          </div>
        </div>

        {/* Project and Activity Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project *
            </label>
            <div className="relative">
              <select
                value={timeEntry?.workProjectId || ""}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={isReadOnly}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.workProjectId ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                    {project.customer && ` (${project.customer.name})`}
                  </option>
                ))}
              </select>
              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.workProjectId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.workProjectId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity *
            </label>
            <div className="relative">
              <select
                value={timeEntry?.activityId || ""}
                onChange={(e) =>
                  handleInputChange("activityId", e.target.value)
                }
                disabled={isReadOnly || !timeEntry?.workProjectId}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.activityId ? "border-red-300" : "border-gray-300"
                } ${
                  isReadOnly || !timeEntry?.workProjectId
                    ? "bg-gray-100"
                    : "bg-white"
                }`}
              >
                <option value="">Select an activity...</option>
                {filteredActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
              <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.activityId && (
              <p className="mt-1 text-sm text-red-600">{errors.activityId}</p>
            )}
            {!timeEntry?.workProjectId && (
              <p className="mt-1 text-xs text-gray-500">
                Select a project first
              </p>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={timeEntry?.date || today}
                onChange={(e) => handleInputChange("date", e.target.value)}
                disabled={isReadOnly}
                max={today}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <div className="relative">
              <input
                type="time"
                value={timeEntry?.startTime || ""}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                disabled={isReadOnly}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startTime ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              />
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <div className="relative">
              <input
                type="time"
                value={timeEntry?.endTime || ""}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                disabled={isReadOnly}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endTime ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              />
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Duration Display */}
        {duration > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <div className="text-sm text-blue-700">
                <strong>Duration:</strong> {formatDuration(duration)}
              </div>
            </div>
          </div>
        )}

        {/* Read-only info for existing entries */}
        {!isCreating && timeEntry && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Entry Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">
                  {timeEntry.createdAt
                    ? new Date(timeEntry.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p
                  className={`font-medium ${
                    timeEntry.status === "completed"
                      ? "text-green-600"
                      : timeEntry.status === "active"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {timeEntry.status === "completed"
                    ? "Completed"
                    : timeEntry.status === "active"
                    ? "Active"
                    : "Paused"}
                </p>
              </div>
              {timeEntry.isManual && (
                <div className="col-span-2">
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-purple-600">Manual Entry</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
