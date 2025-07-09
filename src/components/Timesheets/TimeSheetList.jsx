// src/components/Timesheets/TimeSheetList.jsx - Main container with calendar views
import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { EnhancedTimeSheetTable } from "./EnhancedTimesheetTable";
import { NewTimeEntryModal } from "./NewTimeEntryModal";
import { TimesheetCalendarView } from "./TimesheetCalendarView";
import { timesheetService } from "../../services/timesheets";
import { processService } from "../../services/processes";
import { organizationService } from "../../services/organizations";
import { customerService } from "../../services/customers";
import { showToast } from "../../utils/toast";

export const TimeSheetList = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // View states
  const [viewMode, setViewMode] = useState("list"); // "list", "calendar"
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data for dropdowns
  const [processes, setProcesses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    hasNext: false,
    hasPrev: false,
  });

  const { user, isInitialized } = useAuth();

  useEffect(() => {
    // Only load data if user is authenticated and auth is initialized
    if (isInitialized && user) {
      loadInitialData();
    }
  }, [isInitialized, user]);

  useEffect(() => {
    // Only load time entries if user is authenticated
    if (isInitialized && user) {
      loadTimeEntries();
    }
  }, [currentDate, viewMode, isInitialized, user]);

  const loadInitialData = async () => {
    try {
      // Load all data in parallel (processes will also load activities)
      await Promise.all([
        loadOrganizations(),
        loadProcesses(), // This now also loads activities
        loadCustomers(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await organizationService.getUserOrganizations();
      if (response.success) {
        setOrganizations(response.data || []);
      } else {
        console.error("Failed to load organizations:", response);
        showToast.error("Failed to load organizations");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error(`Error loading organizations: ${error.message}`);
    }
  };

  const loadProcesses = async () => {
    try {
      const response = await processService.getProcesses();
      if (response.success) {
        const processesData = response.data?.processes || response.data || [];
        setProcesses(processesData);

        // Extract activities from the loaded processes
        const allActivities = [];
        processesData.forEach((process) => {
          if (process.activities && Array.isArray(process.activities)) {
            process.activities.forEach((activity) => {
              allActivities.push({
                ...activity,
                processId: process.id,
                processName: process.name,
              });
            });
          }
        });
        setActivities(allActivities);
      } else {
        console.error("Failed to load processes:", response);
        showToast.error("Failed to load processes");
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast.error(`Error loading processes: ${error.message}`);
    }
  };

  const loadActivities = async () => {
    try {
      // Get activities from the processes we already loaded instead of making separate API calls
      if (processes.length > 0) {
        const allActivities = [];
        processes.forEach((process) => {
          if (process.activities && Array.isArray(process.activities)) {
            process.activities.forEach((activity) => {
              allActivities.push({
                ...activity,
                processId: process.id,
                processName: process.name,
              });
            });
          }
        });
        setActivities(allActivities);
      } else {
        // If no processes loaded yet, just set empty array
        setActivities([]);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast.error(`Error loading activities: ${error.message}`);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      if (response.success) {
        setCustomers(response.data || []);
      } else {
        console.error("Failed to load customers:", response);
        showToast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast.error(`Error loading customers: ${error.message}`);
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // For calendar view, get entries for the current month
      let queryParams = {};
      if (viewMode === "calendar") {
        const dateRange = getDateRangeForView();
        queryParams.startDate = dateRange.start;
        queryParams.endDate = dateRange.end;
      }

      const response = await timesheetService.getTimeEntries(queryParams);

      if (response.success) {
        setTimeEntries(response.data || []);
        // TODO: Add pagination support if needed
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalEntries: response.data?.length || 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (err) {
      console.error("Error loading time entries:", err);
      const errorMessage = err.message || "Failed to load time entries";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeForView = () => {
    const date = new Date(currentDate);

    switch (viewMode) {
      case "daily":
        return {
          start: date.toISOString().split("T")[0],
          end: date.toISOString().split("T")[0],
        };

      case "weekly":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: startOfWeek.toISOString().split("T")[0],
          end: endOfWeek.toISOString().split("T")[0],
        };

      case "monthly":
      case "calendar":
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
          start: startOfMonth.toISOString().split("T")[0],
          end: endOfMonth.toISOString().split("T")[0],
        };

      default:
        return { start: "", end: "" };
    }
  };

  const openTimeEntryModal = (mode, entry = null, dateInfo = null) => {
    setModalMode(mode);

    let defaultEntry = {
      organizationId: "",
      customerId: "",
      processId: "",
      activityId: "",
      workLocation: "",
      notes: "",
      startTime: "",
      endTime: "",
      totalHours: 0,
    };

    // If dateInfo is provided (from calendar), use it
    if (dateInfo) {
      defaultEntry = {
        ...defaultEntry,
        startTime: dateInfo.startTime || "",
      };
    }

    setSelectedTimeEntry(entry || defaultEntry);
    setShowTimeEntryModal(true);
  };

  const openTimerStartModal = () => {
    setShowTimerStartModal(true);
  };

  const handleTimeEntrySave = async (entryData) => {
    const loadingToastId = showToast.loading(
      modalMode === "create"
        ? "Creating time entry..."
        : "Updating time entry..."
    );

    try {
      setError(null);

      if (modalMode === "create") {
        const response = await timesheetService.createTimeEntry(entryData);
        if (response.success) {
          setTimeEntries((prev) => [response.data, ...prev]);
          showToast.dismiss(loadingToastId);
          showToast.success("Time entry created successfully");
          setShowTimeEntryModal(false);
          loadTimeEntries();
        }
      } else if (modalMode === "edit") {
        const response = await timesheetService.updateTimeEntry(
          selectedTimeEntry.id || selectedTimeEntry._id,
          entryData
        );
        if (response.success) {
          setTimeEntries((prev) =>
            prev.map((entry) =>
              (entry.id || entry._id) ===
              (selectedTimeEntry.id || selectedTimeEntry._id)
                ? response.data
                : entry
            )
          );
          showToast.dismiss(loadingToastId);
          showToast.success("Time entry updated successfully");
          setShowTimeEntryModal(false);
        }
      }
    } catch (err) {
      console.error("Error saving time entry:", err);
      showToast.dismiss(loadingToastId);
      showToast.error("Failed to save time entry. Please try again.");
    }
  };

  const handleDeleteRequest = (entryId) => {
    const entry = timeEntries.find((e) => (e.id || e._id) === entryId);
    if (entry) {
      setEntryToDelete(entry);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);

    try {
      const entryId = entryToDelete.id || entryToDelete._id;
      await timesheetService.deleteTimeEntry(entryId);

      setTimeEntries((prev) =>
        prev.filter((entry) => (entry.id || entry._id) !== entryId)
      );

      showToast.success("Time entry deleted successfully");
      setShowDeleteModal(false);
      setEntryToDelete(null);
      loadTimeEntries();
    } catch (err) {
      console.error("Error deleting time entry:", err);
      showToast.error("Failed to delete time entry");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-6">
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Timesheet</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track your time and manage entries
              </p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            {/* View Mode Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "calendar"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:space-x-2">
              <Button
                onClick={loadTimeEntries}
                variant="secondary"
                disabled={loading}
                className="w-full lg:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>

              <Button
                onClick={() => openTimeEntryModal("create")}
                className="w-full lg:w-auto"
              >
                <Plus className="h-4 w-4" />
                New Entry
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-red-700">{error}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Time Entries View */}
        {viewMode === "calendar" ? (
          <TimesheetCalendarView
            timeEntries={timeEntries}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onAddEntry={(dateInfo) =>
              openTimeEntryModal("create", null, dateInfo)
            }
            onEditEntry={(entry) => openTimeEntryModal("edit", entry)}
            onDeleteEntry={handleDeleteRequest}
            processes={processes}
            activities={activities}
            organizations={organizations}
            customers={customers}
            loading={loading}
          />
        ) : (
          <EnhancedTimeSheetTable
            timeEntries={timeEntries}
            onEdit={(entry) => openTimeEntryModal("edit", entry)}
            onDelete={handleDeleteRequest}
            processes={processes}
            activities={activities}
            organizations={organizations}
            customers={customers}
            loading={loading}
          />
        )}

        {/* Time Entry Modal */}
        <NewTimeEntryModal
          isOpen={showTimeEntryModal}
          onClose={() => setShowTimeEntryModal(false)}
          timeEntry={selectedTimeEntry}
          onSave={handleTimeEntrySave}
          mode={modalMode}
          processes={processes}
          activities={activities}
          organizations={organizations}
          customers={customers}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Time Entry"
          message="Are you sure you want to delete this time entry? This action cannot be undone."
          confirmText="Delete Entry"
          cancelText="Cancel"
          type="delete"
          isLoading={isDeleting}
          itemName={entryToDelete ? "Time Entry" : null}
        />
      </div>
    </>
  );
};
