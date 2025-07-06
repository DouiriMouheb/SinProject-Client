import React from "react";
import { Building2, Plus, Search, Users } from "lucide-react";
import { Button } from "../common/Button";

export const Customers = () => {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Customer Management
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage customers and their projects across the organization
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Active Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Total Projects
                  </dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            Customer Management Coming Soon
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Customer management functionality will be implemented here.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Features will include: Customer profiles, contact management,
            project assignments, and billing information.
          </p>
        </div>
      </div>
    </div>
  );
};
