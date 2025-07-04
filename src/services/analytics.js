// src/services/analytics.js
import { apiClient } from "./api";

export const analyticsService = {
  // Get dashboard analytics based on user role
  async getDashboardAnalytics() {
    try {
      const response = await apiClient.get("/analytics/dashboard");

      if (response.success) {
        return response;
      } else {
        throw (
          response.error || new Error("Failed to fetch dashboard analytics")
        );
      }
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      throw {
        message: error.message || "Failed to fetch dashboard analytics",
        code: error.code || "ANALYTICS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get detailed ticket analytics
  async getTicketAnalytics(timeframe = "30d") {
    try {
      const response = await apiClient.get(
        `/analytics/tickets?timeframe=${timeframe}`
      );

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch ticket analytics");
      }
    } catch (error) {
      console.error("Error fetching ticket analytics:", error);
      throw {
        message: error.message || "Failed to fetch ticket analytics",
        code: error.code || "ANALYTICS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get recent activity for dashboard
  async getRecentActivity(limit = 10) {
    try {
      const response = await apiClient.get(
        `/analytics/recent-activity?limit=${limit}`
      );

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch recent activity");
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw {
        message: error.message || "Failed to fetch recent activity",
        code: error.code || "ANALYTICS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get user performance metrics
  async getUserMetrics(userId, timeframe = "30d") {
    try {
      const response = await apiClient.get(
        `/analytics/users/${userId}?timeframe=${timeframe}`
      );

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch user metrics");
      }
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      throw {
        message: error.message || "Failed to fetch user metrics",
        code: error.code || "ANALYTICS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get department performance (for managers and admins)
  async getDepartmentMetrics(department, timeframe = "30d") {
    try {
      const response = await apiClient.get(
        `/analytics/departments/${department}?timeframe=${timeframe}`
      );

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch department metrics");
      }
    } catch (error) {
      console.error("Error fetching department metrics:", error);
      throw {
        message: error.message || "Failed to fetch department metrics",
        code: error.code || "ANALYTICS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get system-wide metrics (for admins)
  async getSystemMetrics(timeframe = "30d") {
    try {
      const response = await apiClient.get(
        `/analytics/system?timeframe=${timeframe}`
      );

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch system metrics");
      }
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      throw {
        message: error.message || "Failed to fetch system metrics",
        code: error.code || "ANALYTICS_ERROR",
        type: error.type || "server",
      };
    }
  },
};
