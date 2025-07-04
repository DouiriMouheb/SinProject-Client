import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, AlertCircle, Filter, Play } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { TicketTable } from "./TicketTable";
import { TicketModal } from "./TicketModal";
import { TicketFilters } from "./TicketFilters";
import { TicketDetails } from "./TicketDetails";
import { ticketService } from "../../services/tickets";
import { showToast } from "../../utils/toast";

export const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    department: "",
    assignedTo: "",
    page: 1,
    limit: 10,
    sortBy: "lastActivity",
    sortOrder: "desc",
    search: "",
  });

  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const response = await ticketService.getTickets(cleanFilters);

      if (response.success) {
        setTickets(response.data.tickets || []);
        setPagination(response.data.pagination || {});
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
      const errorMessage = err.message || "Failed to load tickets";
      setError(errorMessage);
      showToast.ticket.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, ticket = null) => {
    setModalMode(mode);
    setSelectedTicket(
      ticket || {
        title: "",
        description: "",
        status: "open",
        priority: "medium",
        category: "general",
        department: user.department,
        assignedTo: "",
        tags: [],
        dueDate: "",
        estimatedHours: "",
      }
    );
    setShowModal(true);
  };

  const viewTicket = (ticket) => {
    setSelectedTicketId(ticket.id || ticket._id);
    setViewMode("details");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedTicketId(null);
  };

  const handleSave = async (ticketData) => {
    const loadingToastId = showToast.loading(
      modalMode === "create" ? "Creating ticket..." : "Updating ticket..."
    );

    try {
      setError(null);

      if (modalMode === "create") {
        const response = await ticketService.createTicket(ticketData);
        if (response.success) {
          // Add new ticket to the beginning of the list
          setTickets((prevTickets) => [response.data.ticket, ...prevTickets]);
          showToast.dismiss(loadingToastId);
          showToast.ticket.created();
          setShowModal(false);

          // Reload to get fresh data and update pagination
          loadTickets();
        }
      } else if (modalMode === "edit") {
        const response = await ticketService.updateTicket(
          selectedTicket.id || selectedTicket._id,
          ticketData
        );
        if (response.success) {
          // Update ticket in the list
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              (t.id || t._id) === (selectedTicket.id || selectedTicket._id)
                ? response.data.ticket
                : t
            )
          );
          showToast.dismiss(loadingToastId);
          showToast.ticket.updated();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error("Error saving ticket:", err);
      showToast.dismiss(loadingToastId);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus, summary = null) => {
    try {
      const response = await ticketService.updateTicketStatus(
        ticketId,
        newStatus,
        summary
      );
      if (response.success) {
        // Update ticket in the list
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            (t.id || t._id) === ticketId ? response.data.ticket : t
          )
        );
        showToast.success(`Ticket status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  };

  const handleAssign = async (ticketId, assignedTo) => {
    try {
      const response = await ticketService.assignTicket(ticketId, assignedTo);
      if (response.success) {
        // Update ticket in the list
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            (t.id || t._id) === ticketId ? response.data.ticket : t
          )
        );
        showToast.success("Ticket assigned successfully");
      }
    } catch (err) {
      console.error("Error assigning ticket:", err);
    }
  };

  // Updated delete handler to use modal
  const handleDeleteRequest = (ticketId) => {
    const ticket = tickets.find((t) => (t.id || t._id) === ticketId);
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);

    try {
      const ticketId = ticketToDelete.id || ticketToDelete._id;

      await ticketService.deleteTicket(ticketId);

      // Remove ticket from the list
      setTickets((prevTickets) =>
        prevTickets.filter((t) => (t.id || t._id) !== ticketId)
      );

      showToast.ticket.deleted();

      // Close modal and reset state
      setShowDeleteModal(false);
      setTicketToDelete(null);

      // Reload to update pagination
      loadTickets();
    } catch (err) {
      console.error("Error deleting ticket:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setTicketToDelete(null);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const dismissError = () => {
    setError(null);
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  // Show ticket details view
  if (viewMode === "details" && selectedTicketId) {
    return (
      <TicketDetails
        ticketId={selectedTicketId}
        onBack={backToList}
        onEdit={(ticket) => {
          setViewMode("list");
          openModal("edit", ticket);
        }}
        onStatusUpdate={(ticketId, newStatus) => {
          // Update the ticket in the list
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              (t.id || t._id) === ticketId ? { ...t, status: newStatus } : t
            )
          );
        }}
        onTicketUpdate={(updatedTicket) => {
          // Update the ticket in the list
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              (t.id || t._id) === (updatedTicket.id || updatedTicket._id)
                ? updatedTicket
                : t
            )
          );
        }}
      />
    );
  }

  // Show list view
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={loadTickets}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {hasRole("user") && (
              <Button onClick={() => openModal("create")}>
                <Plus className="h-5 w-5 mr-2" />
                Create Ticket
              </Button>
            )}
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
                onClick={dismissError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <TicketFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            userRole={user.role}
            userDepartment={user.department}
          />
        )}

        {/* Tickets Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <TicketTable
            tickets={tickets}
            onView={viewTicket}
            onEdit={(ticket) => openModal("edit", ticket)}
            onDelete={handleDeleteRequest}
            onStatusUpdate={handleStatusUpdate}
            onAssign={handleAssign}
            canEdit={hasRole("manager")}
            canDelete={hasRole("admin")}
            canAssign={hasRole("manager")}
            loading={loading}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing{" "}
                {Math.min(
                  (pagination.currentPage - 1) * filters.limit + 1,
                  pagination.totalTickets
                )}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * filters.limit,
                  pagination.totalTickets
                )}{" "}
                of {pagination.totalTickets} tickets
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

        {/* Ticket Create/Edit Modal */}
        <TicketModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          ticket={selectedTicket}
          onChange={setSelectedTicket}
          onSave={handleSave}
          mode={modalMode}
          userRole={user.role}
          userDepartment={user.department}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Ticket"
          message="Are you sure you want to delete this ticket? This action cannot be undone and will permanently remove all ticket data including comments and attachments."
          confirmText="Delete Ticket"
          cancelText="Cancel"
          type="delete"
          isLoading={isDeleting}
          itemName={
            ticketToDelete
              ? `#${String(ticketToDelete.id || ticketToDelete._id).slice(
                  -6
                )} - ${ticketToDelete.title}`
              : null
          }
          details={[
            "All comments and history will be permanently deleted",
            "Any related references will be affected",
            "This action cannot be reversed",
          ]}
        />
      </div>
    </>
  );
};
