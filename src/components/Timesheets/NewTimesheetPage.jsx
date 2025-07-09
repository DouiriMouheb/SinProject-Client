// src/components/Timesheets/NewTimesheetPage.jsx - Test page for new API
import React, { useState, useEffect } from "react";
import { NewTimeEntryModal } from "./NewTimeEntryModal";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { timesheetService } from "../../services";
import { Plus, Clock, Calendar, User, Building } from "lucide-react";

export const NewTimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // Load time entries
  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await timesheetService.getTimeEntries({
        startDate: today,
        endDate: today,
        page: 1,
        limit: 20,
      });

      if (result.success) {
        setTimeEntries(result.data?.timeEntries || []);
      }
    } catch (error) {
      console.error("Error loading time entries:", error);
      showToast("Failed to load time entries", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadTimeEntries();
  }, []);

  // Handle create new entry
  const handleCreateNew = () => {
    setSelectedEntry(null);
    setModalMode("create");
    setShowModal(true);
  };

  // Handle edit entry
  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setModalMode("edit");
    setShowModal(true);
  };

  // Handle delete entry
  const handleDelete = async (entryId) => {
    if (!confirm("Are you sure you want to delete this time entry?")) {
      return;
    }

    try {
      const result = await timesheetService.deleteTimeEntry(entryId);
      if (result.success) {
        showToast("Time entry deleted successfully", "success");
        loadTimeEntries(); // Reload list
      }
    } catch (error) {
      console.error("Error deleting time entry:", error);
      showToast("Failed to delete time entry", "error");
    }
  };

  // Handle modal save
  const handleModalSave = () => {
    loadTimeEntries(); // Reload list
    setShowModal(false);
  };

  // Format duration for display
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = Math.floor((end - start) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            New Timesheet System
          </h1>
          <p className="text-gray-600 mt-2">
            Updated API integration test page
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Time Entry</span>
        </Button>
      </div>

      {/* API Status Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-green-800 font-medium">
            New API Structure Active
          </span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Using organizations → customers → processes → activities workflow
        </p>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Time Entries
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading time entries...</p>
          </div>
        ) : timeEntries.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No time entries today
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first time entry
            </p>
            <Button onClick={handleCreateNew} variant="primary">
              Create Time Entry
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {entry.taskName}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{entry.organization?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{entry.customer?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{entry.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {formatDuration(entry.startTime, entry.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Process:</span>
                      <span className="ml-1 text-gray-700">
                        {entry.process?.name || "N/A"}
                      </span>
                      <span className="text-gray-500 ml-4">Activity:</span>
                      <span className="ml-1 text-gray-700">
                        {entry.activity?.name || "N/A"}
                      </span>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-1 text-gray-700 capitalize">
                        {entry.workLocationType}
                        {entry.workLocationAddress &&
                          ` - ${entry.workLocationAddress}`}
                      </span>
                    </div>

                    {entry.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="text-gray-500">Notes:</span>
                        <span className="ml-1">{entry.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleEdit(entry)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(entry.id)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Entry Modal */}
      <NewTimeEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleModalSave}
        timeEntry={selectedEntry}
        mode={modalMode}
      />
    </div>
  );
};
