// src/components/Timesheets/TimeSheetList.jsx - Main container with calendar views
import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Filter,
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
import { TimerWidget } from "./TimerWidget";
import { TimeSheetTable } from "./TimeSheetTable";
import { TimeSheetFilters } from "./TimeSheetFilters";
import { TimeSheetModal } from "./TimeSheetModal";
import { TimerStartModal } from "./TimerStartModal";
import { timerService } from "../../services/timer";
import { showToast } from "../../utils/toast";

export const TimeSheetList = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);

  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showTimerStartModal, setShowTimerStartModal] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // View states
  const [viewMode, setViewMode] = useState("list"); // "list", "daily", "weekly", "monthly"
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data for dropdowns
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
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

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    workProjectId: "",
    activityId: "",
    customerId: "",
    minDuration: "",
    maxDuration: "",
    page: 1,
    limit: 20,
    sortBy: "startTime",
    sortOrder: "desc",
    search: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTimeEntries();
  }, [filters, currentDate, viewMode]);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadActiveTimer(), loadProjects(), loadActivities()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadActiveTimer = async () => {
    try {
      const response = await timerService.getActiveTimer();
      if (response.success) {
        setActiveTimer(response.data.activeTimer);
      }
    } catch (error) {
      // Don't show error for no active timer
      console.log("No active timer:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await timerService.getWorkProjects();
      if (response.success) {
        setProjects(response.data.projects || []);

        // Extract unique customers
        const uniqueCustomers =
          response.data.projects?.reduce((acc, project) => {
            if (
              project.customer &&
              !acc.find((c) => c.id === project.customer.id)
            ) {
              acc.push(project.customer);
            }
            return acc;
          }, []) || [];
        setCustomers(uniqueCustomers);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await timerService.getProjectsAndActivities();
      if (response.success) {
        // Extract all activities from processes
        const allActivities =
          response.data.processes?.reduce((acc, process) => {
            if (process.activities) {
              acc.push(...process.activities);
            }
            return acc;
          }, []) || [];
        setActivities(allActivities);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters with date range based on view mode
      const queryFilters = { ...filters };

      if (viewMode !== "list") {
        const dateRange = getDateRangeForView();
        queryFilters.startDate = dateRange.start;
        queryFilters.endDate = dateRange.end;
      }

      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(queryFilters).filter(([_, value]) => value !== "")
      );

      const response = await timerService.getTimeEntries(cleanFilters);

      if (response.success) {
        setTimeEntries(response.data.timeEntries || []);
        setPagination(response.data.pagination || {});
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

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);

    switch (viewMode) {
      case "daily":
        newDate.setDate(
          currentDate.getDate() + (direction === "next" ? 1 : -1)
        );
        break;
      case "weekly":
        newDate.setDate(
          currentDate.getDate() + (direction === "next" ? 7 : -7)
        );
        break;
      case "monthly":
        newDate.setMonth(
          currentDate.getMonth() + (direction === "next" ? 1 : -1)
        );
        break;
    }

    setCurrentDate(newDate);
  };

  const getViewTitle = () => {
    const date = new Date(currentDate);

    switch (viewMode) {
      case "daily":
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "weekly":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${endOfWeek.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "monthly":
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
      default:
        return "All Time Entries";
    }
  };

  const handleTimerUpdate = () => {
    loadActiveTimer();
    loadTimeEntries();
  };

  const openTimeEntryModal = (mode, entry = null) => {
    setModalMode(mode);
    setSelectedTimeEntry(
      entry || {
        taskName: "",
        description: "",
        workProjectId: "",
        activityId: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      }
    );
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
        const response = await timerService.createManualEntry(entryData);
        if (response.success) {
          setTimeEntries((prev) => [response.data.timeEntry, ...prev]);
          showToast.dismiss(loadingToastId);
          showToast.success("Time entry created successfully");
          setShowTimeEntryModal(false);
          loadTimeEntries();
        }
      } else if (modalMode === "edit") {
        const response = await timerService.updateTimeEntry(
          selectedTimeEntry.id || selectedTimeEntry._id,
          entryData
        );
        if (response.success) {
          setTimeEntries((prev) =>
            prev.map((entry) =>
              (entry.id || entry._id) ===
              (selectedTimeEntry.id || selectedTimeEntry._id)
                ? response.data.timeEntry
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
    }
  };

  const handleTimerStart = async (timerData) => {
    const loadingToastId = showToast.loading("Starting timer...");

    try {
      const response = await timerService.startTimer(timerData);
      if (response.success) {
        setActiveTimer(response.data.timeEntry);
        showToast.dismiss(loadingToastId);
        showToast.success("Timer started successfully");
        setShowTimerStartModal(false);
        loadTimeEntries();
      }
    } catch (err) {
      console.error("Error starting timer:", err);
      showToast.dismiss(loadingToastId);
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
      await timerService.deleteTimeEntry(entryId);

      setTimeEntries((prev) =>
        prev.filter((entry) => (entry.id || entry._id) !== entryId)
      );

      showToast.success("Time entry deleted successfully");
      setShowDeleteModal(false);
      setEntryToDelete(null);
      loadTimeEntries();
    } catch (err) {
      console.error("Error deleting time entry:", err);
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

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading && timeEntries.length === 0 && !activeTimer) {
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
        {/* Timer Widget */}
        <TimerWidget
          activeTimer={activeTimer}
          onTimerUpdate={handleTimerUpdate}
          onRefresh={loadActiveTimer}
        />

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
                onClick={() => setViewMode("daily")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "daily"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "weekly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:space-x-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                className="w-full "
              >
                <Filter className="h-4 w-4" />
              </Button>

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
              </Button>

              {!activeTimer && (
                <Button
                  onClick={openTimerStartModal}
                  variant="primary"
                  className="w-full lg:w-auto"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Date Navigation for Calendar Views */}
        {viewMode !== "list" && (
          <div className="flex items-center justify-between mb-6 bg-white shadow rounded-lg p-4">
            <Button
              onClick={() => navigateDate("prev")}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                {getViewTitle()}
              </h2>
            </div>

            <Button
              onClick={() => navigateDate("next")}
              variant="ghost"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

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

        {/* Filters */}
        {showFilters && (
          <TimeSheetFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            projects={projects}
            activities={activities}
            customers={customers}
          />
        )}

        {/* Time Entries Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <TimeSheetTable
            timeEntries={timeEntries}
            onView={(entry) => openTimeEntryModal("view", entry)}
            onEdit={(entry) => openTimeEntryModal("edit", entry)}
            onDelete={handleDeleteRequest}
            canEdit={() => true}
            canDelete={() => true}
            loading={loading}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && viewMode === "list" && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing{" "}
                {Math.min(
                  (pagination.currentPage - 1) * filters.limit + 1,
                  pagination.totalEntries
                )}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * filters.limit,
                  pagination.totalEntries
                )}{" "}
                of {pagination.totalEntries} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Time Entry Modal */}
        <TimeSheetModal
          isOpen={showTimeEntryModal}
          onClose={() => setShowTimeEntryModal(false)}
          timeEntry={selectedTimeEntry}
          onChange={setSelectedTimeEntry}
          onSave={handleTimeEntrySave}
          mode={modalMode}
          projects={projects}
          activities={activities}
        />

        {/* Timer Start Modal */}
        <TimerStartModal
          isOpen={showTimerStartModal}
          onClose={() => setShowTimerStartModal(false)}
          onStart={handleTimerStart}
          projects={projects}
          activities={activities}
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
          itemName={
            entryToDelete
              ? `${entryToDelete.taskName} (${entryToDelete.durationMinutes}m)`
              : null
          }
        />
      </div>
    </>
  );
};
