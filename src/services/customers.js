// src/services/customers.js - Customer management service
import { apiClient } from "./api";

export const customerService = {
  // Get all customers with optional filters
  async getCustomers(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/customers?${params.toString()}`);
      return response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get customer by ID
  async getCustomer(customerId) {
    try {
      const response = await apiClient.get(`/customers/${customerId}`);
      return response;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  // Create new customer
  async createCustomer(customerData) {
    try {
      const response = await apiClient.post("/customers", customerData);
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await apiClient.put(
        `/customers/${customerId}`,
        customerData
      );
      return response;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const response = await apiClient.delete(`/customers/${customerId}`);
      return response;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};
