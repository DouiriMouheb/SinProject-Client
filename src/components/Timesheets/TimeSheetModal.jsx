// src/components/Timesheets/TimeSheetModal.jsx - FIXED version with proper data handling
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { timerService } from "../../services/timer";
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
    // Use the timer service validation
    const validationErrors = timerService.validateTimeEntryData(timeEntry);

    if (validationErrors.length > 0) {
      const errorObject = {};
      validationErrors.forEach((error, index) => {
        // Map validation errors to field names
        if (error.includes("Work project")) {
          errorObject.workProjectId = error;
        } else if (error.includes("Activity")) {
          errorObject.activityId = error;
        } else if (error.includes("Task name")) {
          errorObject.taskName = error;
        } else if (error.includes("Date")) {
          errorObject.date = error;
        } else if (error.includes("start time")) {
          errorObject.startTime = error;
        } else if (error.includes("End time") || error.includes("end time")) {
          errorObject.endTime = error;
        } else if (error.includes("Duration")) {
          errorObject.duration = error;
        } else {
          // Generic error
          errorObject.general = error;
        }
      });

      setErrors(errorObject);
      return false;
    }

    setErrors({});
    return true;
  };

  const calculateDuration = () => {
    if (!timeEntry?.startTime || !timeEntry?.endTime || !timeEntry?.date) {
      return 0;
    }

    try {
      const start = new Date(`${timeEntry.date}T${timeEntry.startTime}`);
      const end = new Date(`${timeEntry.date}T${timeEntry.endTime}`);
      return timerService.calculateDuration(start, end);
    } catch (error) {
      return 0;
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

      await onSave(submitData);
    } catch (error) {
      console.error("Error submitting time entry:", error);
      showToast.error("Failed to save time entry. Please try again.");
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

    // Clear general errors
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
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

  // Parse existing time entry data for editing
  const getDisplayValues = () => {
    if (!timeEntry) return { date: today, startTime: "", endTime: "" };

    // If editing an existing entry, extract date and time components
    if (timeEntry.startTime && timeEntry.endTime && !timeEntry.date) {
      const startDate = new Date(timeEntry.startTime);
      const endDate = new Date(timeEntry.endTime);

      return {
        date: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
      };
    }

    // For new entries or entries with separate date/time
    return {
      date: timeEntry.date || today,
      startTime: timeEntry.startTime || "",
      endTime: timeEntry.endTime || "",
    };
  };

  const displayValues = getDisplayValues();

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
        {/* General Error Display */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

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
                value={displayValues.date}
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
                value={displayValues.startTime}
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
                value={displayValues.endTime}
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
                <strong>Duration:</strong>{" "}
                {timerService.formatDuration(duration)}
              </div>
            </div>
          </div>
        )}

        {/* Duration error display */}
        {errors.duration && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.duration}</p>
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
