// src/components/Timesheets/TimeSheetFilters.jsx - Comprehensive filtering
import React from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Search, X, Calendar, Clock, Filter } from "lucide-react";

export const TimeSheetFilters = ({
  filters,
  onFilterChange,
  projects = [],
  activities = [],
  customers = [],
}) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      status: "",
      startDate: "",
      endDate: "",
      workProjectId: "",
      activityId: "",
      customerId: "",
      minDuration: "",
      maxDuration: "",
      search: "",
      sortBy: "startTime",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) =>
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder" &&
      value !== ""
  );

  // Get current date for default values
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const setDateRange = (start, end) => {
    onFilterChange({
      startDate: formatDate(start),
      endDate: formatDate(end),
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Time Entries
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Search and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="Search tasks and descriptions..."
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            icon={Search}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange("sortBy", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="startTime">Start Time</option>
            <option value="endTime">End Time</option>
            <option value="durationMinutes">Duration</option>
            <option value="taskName">Task Name</option>
            <option value="workProject">Project</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleInputChange("sortOrder", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Duration (minutes)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={filters.minDuration}
              onChange={(e) => handleInputChange("minDuration", e.target.value)}
              placeholder="0"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Duration (minutes)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={filters.maxDuration}
              onChange={(e) => handleInputChange("maxDuration", e.target.value)}
              placeholder="∞"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Project and Activity Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={filters.customerId}
            onChange={(e) => handleInputChange("customerId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={filters.workProjectId}
            onChange={(e) => handleInputChange("workProjectId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.customer && ` (${project.customer.name})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity
          </label>
          <select
            value={filters.activityId}
            onChange={(e) => handleInputChange("activityId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Activities</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Date Ranges:
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateRange(today, today)}
            className="text-blue-600 hover:bg-blue-50"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              setDateRange(yesterday, yesterday);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            Yesterday
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateRange(startOfWeek, endOfWeek)}
            className="text-blue-600 hover:bg-blue-50"
          >
            This Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const lastWeekStart = new Date(startOfWeek);
              lastWeekStart.setDate(startOfWeek.getDate() - 7);
              const lastWeekEnd = new Date(lastWeekStart);
              lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
              setDateRange(lastWeekStart, lastWeekEnd);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            Last Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateRange(startOfMonth, endOfMonth)}
            className="text-blue-600 hover:bg-blue-50"
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const lastMonth = new Date(today);
              lastMonth.setMonth(today.getMonth() - 1);
              const lastMonthStart = new Date(
                lastMonth.getFullYear(),
                lastMonth.getMonth(),
                1
              );
              const lastMonthEnd = new Date(
                lastMonth.getFullYear(),
                lastMonth.getMonth() + 1,
                0
              );
              setDateRange(lastMonthStart, lastMonthEnd);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            Last Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const last30Days = new Date(today);
              last30Days.setDate(today.getDate() - 30);
              setDateRange(last30Days, today);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-1">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Status: {filters.status}
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  From: {filters.startDate}
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  To: {filters.endDate}
                </span>
              )}
              {filters.workProjectId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Project:{" "}
                  {projects.find((p) => p.id === filters.workProjectId)?.name ||
                    "Selected"}
                </span>
              )}
              {filters.activityId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Activity:{" "}
                  {activities.find((a) => a.id === filters.activityId)?.name ||
                    "Selected"}
                </span>
              )}
              {(filters.minDuration || filters.maxDuration) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  Duration: {filters.minDuration || "0"} -{" "}
                  {filters.maxDuration || "∞"} min
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
