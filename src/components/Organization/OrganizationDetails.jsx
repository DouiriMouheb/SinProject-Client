// src/components/Organization/OrganizationDetails.jsx - Organization details with its customers
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "../common/Button";
import { organizationService } from "../../services/organizations";
import { customerService } from "../../services/customers";
import { showToast } from "../../utils/toast";
import { CustomerModal } from "../Customers/CustomerModal";
import { ConfirmationModal } from "../common/ConfirmationModal";

export const OrganizationDetails = ({ organizationId, onBack, onEdit }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (organizationId) {
      loadOrganizationDetails();
    }
  }, [organizationId]);

  const loadOrganizationDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Direct API call to ensure we get the full data including customers
      // Adding a cache-busting parameter to avoid cached responses
      const cacheBuster = new Date().getTime();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/organizations/${organizationId}?_=${cacheBuster}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Organization details loaded:", data);
      console.log("Clients:", data.clients ? data.clients.length : 0);

      setOrganization(data);
    } catch (err) {
      console.error("Error loading organization details:", err);
      setError(err.message || "Failed to load organization details");
      showToast.error(err.message || "Failed to load organization details");
    } finally {
      setLoading(false);
    }
  };

  const openAddCustomerModal = () => {
    setSelectedCustomer(null);
    setModalMode("create");
    setShowCustomerModal(true);
  };

  const openEditCustomerModal = (customer) => {
    setSelectedCustomer(customer);
    setModalMode("edit");
    setShowCustomerModal(true);
  };

  const handleCustomerSuccess = (customerData) => {
    console.log("Customer success callback with data:", customerData);
    setShowCustomerModal(false);

    // Update the organization state directly instead of reloading
    setOrganization((prevOrganization) => {
      const currentClients = prevOrganization.clients || [];

      if (modalMode === "create") {
        // Add new customer to the list
        console.log("Adding new customer to list:", customerData);
        return {
          ...prevOrganization,
          clients: [...currentClients, customerData],
        };
      } else {
        // Update existing customer in the list
        console.log("Updating existing customer:", customerData);
        return {
          ...prevOrganization,
          clients: currentClients.map((client) =>
            client.id === customerData.id ? customerData : client
          ),
        };
      }
    });

    showToast.success(
      modalMode === "create"
        ? "Customer created successfully"
        : "Customer updated successfully"
    );
  };

  const handleDeleteRequest = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setActionLoading("delete");
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      showToast.success("Customer deleted successfully");
      setShowDeleteModal(false);

      // Update the organization state directly by removing the deleted customer
      setOrganization((prevOrganization) => ({
        ...prevOrganization,
        clients: (prevOrganization.clients || []).filter(
          (customer) => customer.id !== customerToDelete.id
        ),
      }));

      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      showToast.error("Failed to delete customer. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Organizations
        </Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-yellow-800 font-semibold mb-2">Not Found</h3>
        <p className="text-yellow-600">Organization not found</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button onClick={onBack} variant="ghost" className="text-gray-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Organizations
        </Button>
        <Button onClick={() => onEdit(organization)}>
          <Edit className="h-4 w-4 mr-2" /> Edit Organization
        </Button>
      </div>

      {/* Organization details */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {organization.name}
              </h1>
              {organization.workLocation && (
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {organization.workLocation}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customers Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Users className="h-5 w-5 mr-2" /> Customers
          </h2>
          <Button onClick={openAddCustomerModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>

        {/* Customers list */}
        {organization.clients && organization.clients.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organization.clients.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-lg">
                            {customer.name
                              ? customer.name.charAt(0).toUpperCase()
                              : "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name || "Unnamed Customer"}
                          </div>
                          {customer.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {customer.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.contactEmail || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.contactPhone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.workLocation ? (
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {customer.workLocation}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Not specified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => openEditCustomerModal(customer)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit customer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteRequest(customer)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          title="Delete customer"
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
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center border">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No customers yet
            </h3>
            <p className="text-gray-500 mt-1">
              Add customers to this organization to get started.
            </p>
            <Button
              onClick={openAddCustomerModal}
              variant="primary"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add First Customer
            </Button>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customer={
          selectedCustomer
            ? { ...selectedCustomer, organizationId: organizationId }
            : { organizationId: organizationId }
        }
        mode={modalMode}
        onSuccess={handleCustomerSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.name}?`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        type="danger"
        isLoading={actionLoading === "delete"}
        itemName={customerToDelete ? `${customerToDelete.name}` : ""}
        details={[
          "This action cannot be undone",
          "Customer data will be permanently removed",
          "All associated projects and time entries will be affected",
        ]}
      />
    </div>
  );
};
