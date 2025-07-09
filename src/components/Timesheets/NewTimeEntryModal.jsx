// src/components/Timesheets/NewTimeEntryModal.jsx - Updated for new API structure
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
    workLocationType: "organization", // organization, customer, or home
    taskName: "",
    notes: "",
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

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadOrganizations();
      loadProcesses();
    }
  }, [isOpen]);

  // Load user's organizations
  const loadOrganizations = async () => {
    setLoading((prev) => ({ ...prev, organizations: true }));
    try {
      const result = await organizationService.getUserOrganizations();
      if (result.success) {
        const organizations =
          result.data?.data?.organizations || result.data?.organizations || [];
        setData((prev) => ({
          ...prev,
          organizations,
        }));
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast("Failed to load organizations", "error");
    } finally {
      setLoading((prev) => ({ ...prev, organizations: false }));
    }
  };

  // Load all processes
  const loadProcesses = async () => {
    setLoading((prev) => ({ ...prev, processes: true }));
    try {
      const result = await processService.getAll();
      if (result.success) {
        setData((prev) => ({
          ...prev,
          processes: result.data?.processes || [],
        }));
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast("Failed to load processes", "error");
    } finally {
      setLoading((prev) => ({ ...prev, processes: false }));
    }
  };

  // Load customers for selected organization
  const loadCustomers = async (organizationId) => {
    if (!organizationId) {
      setData((prev) => ({ ...prev, customers: [] }));
      return;
    }

    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const result = await customerService.getCustomersByOrganization(
        organizationId
      );
      if (result.success) {
        setData((prev) => ({
          ...prev,
          customers: result.data?.customers || [],
        }));
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast("Failed to load customers", "error");
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  // Load activities for selected process
  const loadActivities = async (processId) => {
    if (!processId) {
      setData((prev) => ({ ...prev, activities: [] }));
      return;
    }

    setLoading((prev) => ({ ...prev, activities: true }));
    try {
      const result = await processService.getActivities(processId);
      if (result.success) {
        setData((prev) => ({
          ...prev,
          activities: result.data?.activities || [],
        }));
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast("Failed to load activities", "error");
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  // Handle organization change
  const handleOrganizationChange = (organizationId) => {
    setFormData((prev) => ({
      ...prev,
      organizationId,
      customerId: "", // Reset customer selection
    }));
    loadCustomers(organizationId);
  };

  // Handle process change
  const handleProcessChange = (processId) => {
    setFormData((prev) => ({
      ...prev,
      processId,
      activityId: "", // Reset activity selection
    }));
    loadActivities(processId);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.organizationId)
      newErrors.organizationId = "Organization is required";
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.processId) newErrors.processId = "Process is required";
    if (!formData.activityId) newErrors.activityId = "Activity is required";
    if (!formData.taskName.trim()) newErrors.taskName = "Task name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    // Validate time logic
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setLoading((prev) => ({ ...prev, saving: true }));
    try {
      // Prepare data for API
      const timeEntryData = {
        ...formData,
        startTime: new Date(
          `${formData.date}T${formData.startTime}`
        ).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
      };

      let result;
      if (mode === "create") {
        result = await timesheetService.createTimeEntry(timeEntryData);
      } else {
        result = await timesheetService.updateTimeEntry(
          timeEntry.id,
          timeEntryData
        );
      }

      if (result.success) {
        showToast(
          `Time entry ${
            mode === "create" ? "created" : "updated"
          } successfully`,
          "success"
        );
        onSave(result.data);
        onClose();
      }
    } catch (error) {
      console.error("Error saving time entry:", error);
      showToast(
        `Failed to ${mode === "create" ? "create" : "update"} time entry`,
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        organizationId: "",
        customerId: "",
        processId: "",
        activityId: "",
        workLocationType: "organization",
        taskName: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === "create" ? "Create" : "Edit"} Time Entry`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Organization *
          </label>
          <select
            value={formData.organizationId}
            onChange={(e) => handleOrganizationChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.organizationId ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading.organizations}
          >
            <option value="">Select organization...</option>
            {data.organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {errors.organizationId && (
            <p className="text-red-500 text-sm mt-1">{errors.organizationId}</p>
          )}
        </div>

        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Customer *
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange("customerId", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.customerId ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading.customers || !formData.organizationId}
          >
            <option value="">Select customer...</option>
            {data.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
          )}
        </div>

        {/* Process Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Settings className="w-4 h-4 inline mr-2" />
            Process *
          </label>
          <select
            value={formData.processId}
            onChange={(e) => handleProcessChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.processId ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading.processes}
          >
            <option value="">Select process...</option>
            {data.processes.map((process) => (
              <option key={process.id} value={process.id}>
                {process.name}
              </option>
            ))}
          </select>
          {errors.processId && (
            <p className="text-red-500 text-sm mt-1">{errors.processId}</p>
          )}
        </div>

        {/* Activity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4 inline mr-2" />
            Activity *
          </label>
          <select
            value={formData.activityId}
            onChange={(e) => handleInputChange("activityId", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.activityId ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading.activities || !formData.processId}
          >
            <option value="">Select activity...</option>
            {data.activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
          {errors.activityId && (
            <p className="text-red-500 text-sm mt-1">{errors.activityId}</p>
          )}
        </div>

        {/* Work Location Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Work Location *
          </label>
          <select
            value={formData.workLocationType}
            onChange={(e) =>
              handleInputChange("workLocationType", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="organization">Organization Office</option>
            <option value="customer">Customer Site</option>
            <option value="home">Home</option>
          </select>
        </div>

        {/* Task Name */}
        <div>
          <Input
            label="Task Name *"
            icon={<Activity className="w-4 h-4" />}
            value={formData.taskName}
            onChange={(e) => handleInputChange("taskName", e.target.value)}
            placeholder="Enter task description..."
            error={errors.taskName}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Additional notes (optional)..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Date *"
              icon={<Calendar className="w-4 h-4" />}
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              error={errors.date}
            />
          </div>
          <div>
            <Input
              label="Start Time *"
              icon={<Clock className="w-4 h-4" />}
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              error={errors.startTime}
            />
          </div>
          <div>
            <Input
              label="End Time *"
              icon={<Clock className="w-4 h-4" />}
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              error={errors.endTime}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading.saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading.saving}
            disabled={loading.saving}
          >
            {mode === "create" ? "Create" : "Update"} Time Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
