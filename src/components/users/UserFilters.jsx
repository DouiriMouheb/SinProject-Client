// src/components/users/UserFilters.jsx - User filtering component
import React from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Search, X } from "lucide-react";

export const UserFilters = ({
  filters,
  onFilterChange,
  userRole,
  userDepartment,
}) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      department: "",
      role: "",
      isActive: "",
      search: "",
      sortBy: "createdAt",
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

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Users</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            icon={Search}
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Department Filter - Only for admins */}
        {userRole === "admin" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Legal">Legal</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Users</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange("sortBy", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="department">Department</option>
            <option value="lastLogin">Last Login</option>
            <option value="isActive">Status</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Sort Order */}
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

        {/* Items per page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Items per page
          </label>
          <select
            value={filters.limit}
            onChange={(e) =>
              handleInputChange("limit", parseInt(e.target.value))
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Filter Summary */}
        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            {hasActiveFilters && (
              <div className="space-y-1">
                <p className="font-medium">Active Filters:</p>
                <div className="flex flex-wrap gap-1">
                  {filters.search && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.role && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Role: {filters.role}
                    </span>
                  )}
                  {filters.department && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Dept: {filters.department}
                    </span>
                  )}
                  {filters.isActive !== "" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Status:{" "}
                      {filters.isActive === "true" ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Filters:
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({ isActive: "true", role: "", department: "" })
            }
            className="text-green-600 hover:bg-green-50"
          >
            Active Users
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({ isActive: "false", role: "", department: "" })
            }
            className="text-red-600 hover:bg-red-50"
          >
            Inactive Users
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({ role: "admin", isActive: "", department: "" })
            }
            className="text-red-600 hover:bg-red-50"
          >
            Admins
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({ role: "manager", isActive: "", department: "" })
            }
            className="text-blue-600 hover:bg-blue-50"
          >
            Managers
          </Button>
          {userRole === "admin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFilterChange({
                  department: userDepartment,
                  role: "",
                  isActive: "",
                })
              }
              className="text-purple-600 hover:bg-purple-50"
            >
              My Department
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({
                sortBy: "lastLogin",
                sortOrder: "desc",
                role: "",
                department: "",
                isActive: "",
              })
            }
            className="text-gray-600 hover:bg-gray-50"
          >
            Recent Logins
          </Button>
        </div>
      </div>

      {/* Filter Help */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600">
          <strong>Tips:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Use the search box to find users by name or email</li>
            <li>Combine multiple filters to narrow down results</li>
            {userRole === "manager" && (
              <li>
                As a manager, you can only see users in your department (
                {userDepartment})
              </li>
            )}
            {userRole === "admin" && (
              <li>
                As an admin, you can see and manage all users across departments
              </li>
            )}
            <li>
              Click "Clear Filters" to reset all filters and show all users
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
