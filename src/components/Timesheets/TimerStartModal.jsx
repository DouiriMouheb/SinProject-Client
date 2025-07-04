// src/components/Timesheets/TimerStartModal.jsx - Start new timer
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { Briefcase, Activity, Play, Clock } from "lucide-react";

export const TimerStartModal = ({
  isOpen,
  onClose,
  onStart,
  projects = [],
  activities = [],
}) => {
  const [timerData, setTimerData] = useState({
    workProjectId: "",
    activityId: "",
    taskName: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTimerData({
        workProjectId: "",
        activityId: "",
        taskName: "",
        description: "",
      });
      setErrors({});
      setIsSubmitting(false);
      setSelectedProject(null);
    }
  }, [isOpen]);

  // Update filtered activities when project changes
  useEffect(() => {
    if (timerData.workProjectId) {
      const project = projects.find((p) => p.id === timerData.workProjectId);
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  }, [timerData.workProjectId, projects]);

  useEffect(() => {
    // For now, show all activities since we don't have project-activity mapping
    setFilteredActivities(activities);
  }, [activities, selectedProject]);

  // No required fields: validation always passes
  const validateForm = () => {
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      showToast.error("Please fix the errors below and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        workProjectId: timerData.workProjectId,
        activityId: timerData.activityId,
        taskName: timerData.taskName.trim(),
        description: timerData.description?.trim() || "",
      };

      await onStart(submitData);
    } catch (error) {
      console.error("Error starting timer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTimerData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProjectChange = (projectId) => {
    // Clear activity when project changes
    setTimerData((prev) => ({
      ...prev,
      workProjectId: projectId,
      activityId: "",
    }));

    // Clear errors
    if (errors.workProjectId) {
      setErrors((prev) => ({ ...prev, workProjectId: "", activityId: "" }));
    }
  };

  // Get recent projects for quick selection
  const getRecentProjects = () => {
    // For now, just return first few projects
    // In a real app, this would be based on user's recent activity
    return projects.slice(0, 3);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Timer"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Starting...
              </div>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Quick Start from Recent Projects */}
        {getRecentProjects().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Start (Recent Projects)
            </label>
            <div className="space-y-2">
              {getRecentProjects().map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectChange(project.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {project.name}
                      </p>
                      {project.customer && (
                        <p className="text-xs text-gray-500">
                          {project.customer.name}
                        </p>
                      )}
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">
                or select manually below
              </span>
            </div>
          </div>
        )}

        {/* Manual Selection */}
        <div className="space-y-4">
          <Input
            label="Task Name"
            type="text"
            value={timerData.taskName}
            onChange={(e) => handleInputChange("taskName", e.target.value)}
            required={false}
            error={errors.taskName}
            placeholder="What are you working on?"
            icon={Briefcase}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={timerData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add more details..."
            />
          </div>
        </div>

        {/* Project and Activity Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <div className="relative">
              <select
                value={timerData.workProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.workProjectId ? "border-red-300" : "border-gray-300"
                } bg-white`}
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
              Activity
            </label>
            <div className="relative">
              <select
                value={timerData.activityId}
                onChange={(e) =>
                  handleInputChange("activityId", e.target.value)
                }
                disabled={!timerData.workProjectId}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.activityId ? "border-red-300" : "border-gray-300"
                } ${!timerData.workProjectId ? "bg-gray-100" : "bg-white"}`}
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
            {!timerData.workProjectId && (
              <p className="mt-1 text-xs text-gray-500">
                Select a project first
              </p>
            )}
          </div>
        </div>

        {/* Selected Project Info */}
        {selectedProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <Briefcase className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">{selectedProject.name}</p>
                {selectedProject.customer && (
                  <p className="text-blue-600">
                    Client: {selectedProject.customer.name}
                  </p>
                )}
                {selectedProject.description && (
                  <p className="mt-1 text-blue-600">
                    {selectedProject.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timer Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-start">
            <Clock className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Timer Info</p>
              <ul className="mt-1 space-y-1 text-yellow-600">
                <li>
                  • Timer will start immediately when you click "Start Timer"
                </li>
                <li>
                  • You can pause/resume the timer anytime from the widget above
                </li>
                <li>• Remember to stop the timer when you finish your task</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
