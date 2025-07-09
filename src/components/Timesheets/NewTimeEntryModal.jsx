// src/components/Timesheets/NewTimeEntryModal.jsx - Cascading workflow implementation
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import {
  organizationService,
  customerService,
  processService,
  timesheetService,
} from "../../services";
import {
  Building,
  Users,
  Settings,
  Activity,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

export const NewTimeEntryModal = ({
  isOpen,
  onClose,
  onSave,
  timeEntry = null,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    organizationId: "",
    customerId: "",
    processId: "",
    activityId: "",
    workPlaceType: "organization",
    taskName: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
  });

  const [data, setData] = useState({
    organizations: [],
    customers: [],
    processes: [],
    activities: [],
  });

  const [loading, setLoading] = useState({
    organizations: false,
    customers: false,
    processes: false,
    activities: false,
    saving: false,
  });

  const [errors, setErrors] = useState({});

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadOrganizations();
      loadProcesses();

      if (mode === "edit" && timeEntry) {
        populateFormForEdit();
      }
    }
  }, [isOpen, mode, timeEntry]);

  // Load customers when organization changes
  useEffect(() => {
    if (formData.organizationId) {
      loadCustomers(formData.organizationId);
    } else {
      setData((prev) => ({ ...prev, customers: [] }));
      setFormData((prev) => ({ ...prev, customerId: "", activityId: "" }));
    }
  }, [formData.organizationId]);

  // Load activities when process changes
  useEffect(() => {
    if (formData.processId) {
      loadActivitiesForProcess(formData.processId);
    } else {
      setData((prev) => ({ ...prev, activities: [] }));
      setFormData((prev) => ({ ...prev, activityId: "" }));
    }
  }, [formData.processId]);

  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    // Round to nearest 5 minutes
    now.setMinutes(Math.round(now.getMinutes() / 5) * 5, 0, 0);
    const startTime = now.toTimeString().slice(0, 5);
    const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const endTime = end.toTimeString().slice(0, 5);
    setFormData({
      organizationId: "",
      customerId: "",
      processId: "",
      activityId: "",
      workPlaceType: "organization",
      taskName: "",
      description: "",
      date: today,
      startTime,
      endTime,
    });
    setData({
      organizations: [],
      customers: [],
      processes: [],
      activities: [],
    });
    setErrors({});
  };

  const populateFormForEdit = () => {
    if (timeEntry) {
      const startDate = timeEntry.startTime
        ? new Date(timeEntry.startTime)
        : new Date();
      const endDate = timeEntry.endTime ? new Date(timeEntry.endTime) : null;

      setFormData({
        organizationId: timeEntry.organizationId || "",
        customerId: timeEntry.customerId || "",
        processId: timeEntry.processId || "",
        activityId: timeEntry.activityId || "",
        workPlaceType: timeEntry.workPlaceType || "organization",
        taskName: timeEntry.taskName || "",
        description: timeEntry.description || "",
        date: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate ? endDate.toTimeString().slice(0, 5) : "",
      });
    }
  };

  const loadOrganizations = async () => {
    setLoading((prev) => ({ ...prev, organizations: true }));
    try {
      const result = await organizationService.getUserOrganizations();
      if (result.success) {
        const organizations =
          result.data?.data?.organizations ||
          result.data?.organizations ||
          result.data ||
          [];
        setData((prev) => ({ ...prev, organizations }));
      } else {
        showToast.error("Failed to load organizations");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations");
    } finally {
      setLoading((prev) => ({ ...prev, organizations: false }));
    }
  };

  const loadCustomers = async (organizationId) => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const result = await customerService.getCustomers({ organizationId });
      if (result.success) {
        const customers = result.data?.customers || result.data || [];
        setData((prev) => ({ ...prev, customers }));
      } else {
        showToast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast.error("Failed to load customers");
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  const loadProcesses = async () => {
    setLoading((prev) => ({ ...prev, processes: true }));
    try {
      const result = await processService.getProcesses();
      if (result.success) {
        const processes = result.data?.processes || result.data || [];
        setData((prev) => ({ ...prev, processes }));
      } else {
        showToast.error("Failed to load processes");
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast.error("Failed to load processes");
    } finally {
      setLoading((prev) => ({ ...prev, processes: false }));
    }
  };

  const loadActivitiesForProcess = async (processId) => {
    setLoading((prev) => ({ ...prev, activities: true }));
    try {
      const selectedProcess = data.processes.find((p) => p.id === processId);
      if (selectedProcess && selectedProcess.activities) {
        setData((prev) => ({
          ...prev,
          activities: selectedProcess.activities,
        }));
      } else {
        const result = await processService.getById(processId);
        if (result.success && result.data?.activities) {
          setData((prev) => ({ ...prev, activities: result.data.activities }));
        } else {
          setData((prev) => ({ ...prev, activities: [] }));
        }
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast.error("Failed to load activities");
      setData((prev) => ({ ...prev, activities: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "organizationId") {
      setFormData((prev) => ({ ...prev, customerId: "", activityId: "" }));
    } else if (field === "processId") {
      setFormData((prev) => ({ ...prev, activityId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organizationId)
      newErrors.organizationId = "Organization is required";
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.processId) newErrors.processId = "Process is required";
    if (!formData.activityId) newErrors.activityId = "Activity is required";
    if (!formData.taskName.trim()) newErrors.taskName = "Task name is required";

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0); // Normalize time to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time to midnight

      if (selectedDate > today) {
        newErrors.date = "Cannot add entries for future dates";
      }
    }

    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date} ${formData.startTime}`);
      const end = new Date(`${formData.date} ${formData.endTime}`);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error("Please fix the errors before submitting");
      return;
    }

    setLoading((prev) => ({ ...prev, saving: true }));

    try {
      const timeEntryData = {
        organizationId: formData.organizationId,
        customerId: formData.customerId,
        processId: formData.processId,
        activityId: formData.activityId,
        workPlaceType: formData.workPlaceType,
        taskName: formData.taskName.trim(),
        description: formData.description.trim(),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      let result;
      if (mode === "create") {
        result = await timesheetService.createTimeEntry(timeEntryData);
        showToast.success("Time entry created successfully");
      } else {
        result = await timesheetService.updateTimeEntry(
          timeEntry.id,
          timeEntryData
        );
        showToast.success("Time entry updated successfully");
      }

      if (result.success) {
        onSave && onSave(result.data);
        onClose();
      }
    } catch (error) {
      console.error("Error saving time entry:", error);
      showToast.error(`Failed to ${mode} time entry. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const getMaxDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Add New Time Entry" : "Edit Time Entry"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* First row - Selection fields in 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Organization Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 inline mr-2" />
              Organization *
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) =>
                handleInputChange("organizationId", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.organizationId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading.organizations}
            >
              <option value="">Select an organization...</option>
              {data.organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organizationId}
              </p>
            )}
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-2" />
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleInputChange("customerId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customerId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={!formData.organizationId || loading.customers}
            >
              <option value="">
                {!formData.organizationId
                  ? "Select an organization first..."
                  : loading.customers
                  ? "Loading customers..."
                  : "Select a customer..."}
              </option>
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
            )}
          </div>

          {/* Work Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Work Location
            </label>
            <select
              value={formData.workPlaceType}
              onChange={(e) =>
                handleInputChange("workPlaceType", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="organization">Organization Location</option>
              <option value="customer">Customer Location</option>
              <option value="home">Work from Home</option>
            </select>
          </div>
        </div>

        {/* Second row - Process and Activity in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Process Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Settings className="h-4 w-4 inline mr-2" />
              Process *
            </label>
            <select
              value={formData.processId}
              onChange={(e) => handleInputChange("processId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.processId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading.processes}
            >
              <option value="">Select a process...</option>
              {data.processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
            </select>
            {errors.processId && (
              <p className="mt-1 text-sm text-red-600">{errors.processId}</p>
            )}
          </div>

          {/* Activity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Activity className="h-4 w-4 inline mr-2" />
              Activity *
            </label>
            <select
              value={formData.activityId}
              onChange={(e) => handleInputChange("activityId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.activityId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={!formData.processId || loading.activities}
            >
              <option value="">
                {!formData.processId
                  ? "Select a process first..."
                  : loading.activities
                  ? "Loading activities..."
                  : "Select an activity..."}
              </option>
              {data.activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
            {errors.activityId && (
              <p className="mt-1 text-sm text-red-600">{errors.activityId}</p>
            )}
          </div>
        </div>

        {/* Third row - Task details in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <Input
              type="text"
              value={formData.taskName}
              onChange={(e) => handleInputChange("taskName", e.target.value)}
              placeholder="Enter task name"
              error={errors.taskName}
              maxLength={300}
            />
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              max={getMaxDate()}
              error={errors.date}
            />
            <p className="mt-1 text-xs text-gray-500">
              You can only add entries for today or past dates
            </p>
          </div>
        </div>

        {/* Fourth row - Description full width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Optional task description"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fifth row - Time Range in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Start Time *
            </label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              error={errors.startTime}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              End Time *
            </label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              error={errors.endTime}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2 pt-2 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading.saving}
            className="min-w-[120px]"
          >
            {loading.saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : mode === "create" ? (
              "Create Entry"
            ) : (
              "Update Entry"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
