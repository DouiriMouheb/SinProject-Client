// src/components/Timesheets/EnhancedTimeSheetTable.jsx - Enhanced time entries table with search, pagination, and column reordering
import React, { useState, useMemo } from "react";
import {
  Edit,
  Trash2,
  Clock,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  X,
  Briefcase,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ProfilePicture } from "../common/ProfilePicture";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const today = new Date();

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  } catch (error) {
    return "Invalid date";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "N/A";
  }
};

const formatDuration = (hours) => {
  if (!hours || hours === 0) return "0h";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours > 0 && minutes > 0) {
    return `${wholeHours}h ${minutes}m`;
  } else if (wholeHours > 0) {
    return `${wholeHours}h`;
  } else {
    return `${minutes}m`;
  }
};

// Default column configuration - Only essential columns
const DEFAULT_COLUMNS = [
  {
    id: "date",
    key: "startTime",
    label: "Date",
    sortable: true,
    visible: true,
    searchable: false,
    width: "120px",
  },
  {
    id: "task",
    key: "processId",
    label: "Process & Activity",
    sortable: true,
    visible: true,
    searchable: true,
    width: "auto",
  },
  {
    id: "actions",
    key: "actions",
    label: "Actions",
    sortable: false,
    visible: true,
    searchable: false,
    width: "120px",
  },
];

export const EnhancedTimeSheetTable = ({
  timeEntries = [],
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,
  loading = false,
  processes = [],
  activities = [],
  organizations = [],
  customers = [],
}) => {
  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "startTime",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // Removed expandedEntry state and toggle logic

  // Use fixed columns - no customization
  const columns = DEFAULT_COLUMNS;

  // Helper functions
  const getProcessName = (processId) => {
    const process = processes.find((p) => (p.id || p._id) === processId);
    return process ? process.name : "Unknown Process";
  };

  const getActivityName = (activityId) => {
    const activity = activities.find((a) => (a.id || a._id) === activityId);
    return activity ? activity.name : "Unknown Activity";
  };

  const getOrganizationName = (organizationId) => {
    const organization = organizations.find(
      (o) => (o.id || o._id) === organizationId
    );
    return organization ? organization.name : "Unknown Organization";
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => (c.id || c._id) === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  // Get nested property value
  const getNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce(
        (current, prop) =>
          current && current[prop] !== undefined ? current[prop] : null,
        obj
      );
  };

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return timeEntries;

    const searchLower = searchTerm.toLowerCase();
    return timeEntries.filter((entry) => {
      // Search in process name, activity name, customer name, organization name, and notes
      const processName = getProcessName(entry.processId);
      const activityName = getActivityName(entry.activityId);
      const customerName = getCustomerName(entry.customerId);
      const organizationName = getOrganizationName(entry.organizationId);
      const notes = entry.notes || "";

      return (
        processName.toLowerCase().includes(searchLower) ||
        activityName.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
        organizationName.toLowerCase().includes(searchLower) ||
        notes.toLowerCase().includes(searchLower)
      );
    });
  }, [
    timeEntries,
    searchTerm,
    processes,
    activities,
    customers,
    organizations,
  ]);

  // Sort entries
  const sortedEntries = useMemo(() => {
    if (!sortConfig.key) return filteredEntries;

    const sorted = [...filteredEntries].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Handle dates
      if (sortConfig.key.includes("Time") || sortConfig.key.includes("Date")) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle strings and numbers
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? result : -result;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [filteredEntries, sortConfig]);

  // Paginate entries
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEntries.slice(startIndex, startIndex + pageSize);
  }, [sortedEntries, currentPage, pageSize]);

  // Pagination info
  const totalPages = Math.ceil(sortedEntries.length / pageSize);
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, sortedEntries.length);

  // Handlers
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortConfig({ key: "startTime", direction: "desc" });
    setCurrentPage(1);
  };

  const visibleColumns = columns.filter((col) => col.visible);

  // Removed toggleExpanded function

  if (loading && timeEntries.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading time entries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Table Header with Search and Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder=""
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10 pr-10 rounded-full border border-black shadow-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Search"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            />
            {!searchTerm && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Reset Filters */}
            {(searchTerm ||
              sortConfig.key !== "startTime" ||
              sortConfig.direction !== "desc") &&
              !searchTerm && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "No entries found" : "No time entries found"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Start tracking your time to see entries here"}
            </p>
          </div>
        ) : (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start - End
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEntries.map((entry) => {
                  if (!entry || (!entry.id && !entry._id)) return null;
                  const entryId = entry.id || entry._id;
                  return (
                    <tr
                      key={entryId}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Date Column */}
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="font-medium">
                            {formatDate(entry.startTime)}
                          </div>
                        </div>
                      </td>
                      {/* Start-End Time Column */}
                      <td className="px-4 py-3 text-sm">
                        {formatTime(entry.startTime)}
                        {entry.endTime && ` - ${formatTime(entry.endTime)}`}
                      </td>
                      {/* Process Column */}
                      <td className="px-4 py-3 text-sm">
                        {getProcessName(entry.processId)}
                      </td>
                      {/* Actions Column */}
                      <td className="px-4 py-3 text-sm text-right w-32">
                        <div className="flex items-center justify-end space-x-2">
                          {canEdit(entry) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(entry);
                              }}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit entry"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete(entry) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(entryId);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination and Results Info */}
            {sortedEntries.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center w-full">
                  <div className="text-sm text-gray-700 flex-1 flex items-center justify-center sm:justify-start">
                    Showing {startEntry} to {endEntry} of {sortedEntries.length}{" "}
                    entries
                    {searchTerm && (
                      <span className="text-gray-500">
                        {" "}
                        (filtered from {timeEntries.length} total)
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end mt-2 sm:mt-0">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-2 text-sm border border-gray-900 rounded-full bg-white text-gray-900 px-2 py-1 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ minWidth: 56 }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1 order-2 sm:order-1 mt-2 sm:mt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          if (pageNum < 1 || pageNum > totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pageNum === currentPage ? "primary" : "ghost"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-8 w-8 p-0 ${
                                pageNum === currentPage
                                  ? "bg-blue-100 text-blue-700"
                                  : ""
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
