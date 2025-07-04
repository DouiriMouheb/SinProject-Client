// src/services/tickets.js - Enhanced ticket service
import { apiClient } from "./api";

export const ticketService = {
  // Get all tickets with filters
  async getTickets(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/tickets${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw {
        message: error.message || "Failed to fetch tickets",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get single ticket by ID
  async getTicket(id) {
    try {
      const response = await apiClient.get(`/tickets/${id}`);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch ticket");
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw {
        message: error.message || "Failed to fetch ticket",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Create new ticket
  async createTicket(ticketData) {
    try {
      const response = await apiClient.post("/tickets", ticketData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw {
        message: error.message || "Failed to create ticket",
        code: error.code || "CREATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Update ticket
  async updateTicket(id, ticketData) {
    try {
      const response = await apiClient.put(`/tickets/${id}`, ticketData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw {
        message: error.message || "Failed to update ticket",
        code: error.code || "UPDATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Update ticket status
  async updateTicketStatus(id, status, summary = null) {
    try {
      const payload = { status };
      if (summary) {
        payload.summary = summary;
      }

      const response = await apiClient.put(`/tickets/${id}/status`, payload);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to update ticket status");
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw {
        message: error.message || "Failed to update ticket status",
        code: error.code || "UPDATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Assign ticket to user
  async assignTicket(id, assignedTo) {
    try {
      const response = await apiClient.put(`/tickets/${id}/assign`, {
        assignedTo,
      });

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to assign ticket");
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      throw {
        message: error.message || "Failed to assign ticket",
        code: error.code || "ASSIGN_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Add comment to ticket
  async addComment(id, content, isInternal = false) {
    try {
      const response = await apiClient.post(`/tickets/${id}/comments`, {
        content,
        isInternal,
      });

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw {
        message: error.message || "Failed to add comment",
        code: error.code || "COMMENT_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Delete ticket (admin only)
  async deleteTicket(id) {
    try {
      const response = await apiClient.delete(`/tickets/${id}`);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw {
        message: error.message || "Failed to delete ticket",
        code: error.code || "DELETE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get ticket statistics
  async getTicketStats() {
    try {
      const response = await apiClient.get("/tickets/stats/overview");

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch ticket statistics");
      }
    } catch (error) {
      console.error("Error fetching ticket statistics:", error);
      throw {
        message: error.message || "Failed to fetch ticket statistics",
        code: error.code || "STATS_ERROR",
        type: error.type || "server",
      };
    }
  },
};
