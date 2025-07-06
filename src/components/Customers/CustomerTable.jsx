// src/components/Customers/CustomerTable.jsx - Customer table component
import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { Button } from "../common/Button";

const formatDate = (dateString) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const CustomerTable = ({ customers = [], onView, onEdit, onDelete }) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
          No customers
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Get started by creating a new customer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-50 dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {/* Customer Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {customer.name}
                      </div>
                      {customer.description && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {customer.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {customer.contactEmail && (
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                        <span className="truncate max-w-xs">
                          {customer.contactEmail}
                        </span>
                      </div>
                    )}
                    {customer.contactPhone && (
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                        <span>{customer.contactPhone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                        <span className="truncate max-w-xs">
                          {customer.address}
                        </span>
                      </div>
                    )}
                    {!customer.contactEmail &&
                      !customer.contactPhone &&
                      !customer.address && (
                        <span className="text-sm text-slate-400 dark:text-slate-500">
                          No contact info
                        </span>
                      )}
                  </div>
                </td>

                {/* Projects */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {customer.workProjects?.length || 0} projects
                  </div>
                  {customer.workProjects &&
                    customer.workProjects.length > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Latest: {customer.workProjects[0].name}
                      </div>
                    )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => onView(customer)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onEdit(customer)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(customer)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
