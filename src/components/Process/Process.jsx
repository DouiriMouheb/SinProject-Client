import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Plus,
  Search,
  Activity,
  Zap,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { showToast } from "../../utils/toast";
// import { timerService } from "../../services/timer"; // Legacy - disabled
import { processService } from "../../services"; // NEW: Use process service
import { useAuth } from "../../hooks/useAuth";

export const Process = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'process' or 'activity'
  const [modalMode, setModalMode] = useState("create"); // create, edit

  // Form states
  const [processForm, setProcessForm] = useState({ name: "", description: "" });
  const [activityForm, setActivityForm] = useState({
    name: "",
    description: "",
    processId: "",
  });

  const { user, isInitialized } = useAuth();

  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      // Use getAll() instead of getAllWithActivities() to avoid multiple API calls
      const response = await processService.getAll();
      if (response.success) {
        setProcesses(response.data.processes || []);
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast.error("Failed to load processes");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  useEffect(() => {
    // Only load processes if user is authenticated
    if (isInitialized && user) {
      loadProcesses();
    }
  }, [isInitialized, user]); // Removed loadProcesses from dependencies

  // Remove the search-triggered useEffect since we'll filter client-side

  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivities = processes.reduce(
    (total, process) => total + (process.activities?.length || 0),
    0
  );

  const openProcessModal = (mode, process = null) => {
    setModalMode(mode);
    setSelectedProcess(process);
    setProcessForm(
      process
        ? { name: process.name, description: process.description || "" }
        : { name: "", description: "" }
    );
    setShowProcessModal(true);
  };

  const openActivityModal = (mode, activity = null, processId = null) => {
    setModalMode(mode);
    setSelectedActivity(activity);
    setActivityForm(
      activity
        ? {
            name: activity.name,
            description: activity.description || "",
            processId: activity.processId,
          }
        : { name: "", description: "", processId: processId || "" }
    );
    setShowActivityModal(true);
  };

  const openDeleteModal = (type, item) => {
    setDeleteType(type);
    if (type === "process") {
      setSelectedProcess(item);
    } else {
      setSelectedActivity(item);
    }
    setShowDeleteModal(true);
  };

  const handleProcessSave = async () => {
    if (!processForm.name.trim()) {
      showToast.error("Process name is required");
      return;
    }

    try {
      if (modalMode === "create") {
        await processService.create(processForm);
        showToast.success("Process created successfully");
      } else {
        await processService.update(selectedProcess.id, processForm);
        showToast.success("Process updated successfully");
      }
      setShowProcessModal(false);
      loadProcesses();
    } catch (error) {
      showToast.error(`Failed to ${modalMode} process: ${error.message}`);
    }
  };

  const handleActivitySave = async () => {
    if (!activityForm.name.trim()) {
      showToast.error("Activity name is required");
      return;
    }

    if (modalMode === "create" && !activityForm.processId) {
      showToast.error("Please select a process");
      return;
    }

    try {
      if (modalMode === "create") {
        await processService.createActivity(activityForm.processId, {
          name: activityForm.name,
          description: activityForm.description,
        });
        showToast.success("Activity created successfully");
      } else {
        await processService.updateActivity(
          selectedActivity.processId,
          selectedActivity.id,
          {
            name: activityForm.name,
            description: activityForm.description,
          }
        );
        showToast.success("Activity updated successfully");
      }
      setShowActivityModal(false);
      loadProcesses();
    } catch (error) {
      showToast.error(`Failed to ${modalMode} activity: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === "process") {
        await processService.delete(selectedProcess.id);
        showToast.success("Process deleted successfully");
      } else {
        await processService.deleteActivity(
          selectedActivity.processId,
          selectedActivity.id
        );
        showToast.success("Activity deleted successfully");
      }
      setShowDeleteModal(false);
      loadProcesses();
    } catch (error) {
      showToast.error(`Failed to delete ${deleteType}: ${error.message}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Process Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage processes and their activities across the organization
          </p>
        </div>

        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => openProcessModal("create")}>
            <Plus className="h-5 w-5 mr-2" />
            Add Process
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Processes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {processes.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Activities
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalActivities}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Processes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {processes.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processes List */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading processes...</span>
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "No processes found" : "No processes yet"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Get started by creating your first process."}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => openProcessModal("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Process
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProcesses.map((process) => (
              <div key={process.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {process.name}
                    </h3>
                    {process.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {process.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        openActivityModal("create", null, process.id)
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Activity
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openProcessModal("edit", process)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal("process", process)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Activities */}
                {process.activities && process.activities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Activities ({process.activities.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {process.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.name}
                              </p>
                              {activity.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openActivityModal("edit", activity)
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openDeleteModal("activity", activity)
                                }
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No activities message */}
                {(!process.activities || process.activities.length === 0) && (
                  <div className="mt-4 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No activities yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openActivityModal("create", null, process.id)
                      }
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Activity
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title={`${modalMode === "create" ? "Create" : "Edit"} Process`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Process Name *
            </label>
            <Input
              type="text"
              value={processForm.name}
              onChange={(e) =>
                setProcessForm({ ...processForm, name: e.target.value })
              }
              placeholder="Enter process name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={processForm.description}
              onChange={(e) =>
                setProcessForm({ ...processForm, description: e.target.value })
              }
              placeholder="Enter process description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowProcessModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProcessSave}>
              {modalMode === "create" ? "Create" : "Update"} Process
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title={`${modalMode === "create" ? "Create" : "Edit"} Activity`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Name *
            </label>
            <Input
              type="text"
              value={activityForm.name}
              onChange={(e) =>
                setActivityForm({ ...activityForm, name: e.target.value })
              }
              placeholder="Enter activity name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={activityForm.description}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  description: e.target.value,
                })
              }
              placeholder="Enter activity description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>
          {modalMode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Process *
              </label>
              <select
                value={activityForm.processId}
                onChange={(e) =>
                  setActivityForm({
                    ...activityForm,
                    processId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
              >
                <option value="">Select a process</option>
                {processes.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowActivityModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleActivitySave}>
              {modalMode === "create" ? "Create" : "Update"} Activity
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={`Delete ${deleteType === "process" ? "Process" : "Activity"}`}
        message={
          deleteType === "process"
            ? `Are you sure you want to delete the process "${selectedProcess?.name}"? This will also delete all associated activities.`
            : `Are you sure you want to delete the activity "${selectedActivity?.name}"?`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
