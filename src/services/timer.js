// src/services/timer.js - Timer service for API integration
import { apiClient } from "./api";

export const timerService = {
  // Get current active timer
  async getActiveTimer() {
    try {
      const response = await apiClient.get("/timer/active");

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch active timer");
      }
    } catch (error) {
      console.error("Error fetching active timer:", error);
      throw {
        message: error.message || "Failed to fetch active timer",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Start a new timer
  async startTimer(timerData) {
    try {
      const response = await apiClient.post("/timer/start", timerData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to start timer");
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      throw {
        message: error.message || "Failed to start timer",
        code: error.code || "START_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Stop active timer
  async stopTimer(description = "") {
    try {
      const response = await apiClient.put("/timer/stop", { description });

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to stop timer");
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      throw {
        message: error.message || "Failed to stop timer",
        code: error.code || "STOP_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Pause active timer
  async pauseTimer() {
    try {
      const response = await apiClient.put("/timer/pause");

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to pause timer");
      }
    } catch (error) {
      console.error("Error pausing timer:", error);
      throw {
        message: error.message || "Failed to pause timer",
        code: error.code || "PAUSE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Resume paused timer
  async resumeTimer() {
    try {
      const response = await apiClient.put("/timer/resume");

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to resume timer");
      }
    } catch (error) {
      console.error("Error resuming timer:", error);
      throw {
        message: error.message || "Failed to resume timer",
        code: error.code || "RESUME_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get time entries with filters
  async getTimeEntries(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/timer/entries${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch time entries");
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw {
        message: error.message || "Failed to fetch time entries",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Update time entry
  async updateTimeEntry(id, entryData) {
    try {
      const response = await apiClient.put(`/timer/entries/${id}`, entryData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to update time entry");
      }
    } catch (error) {
      console.error("Error updating time entry:", error);
      throw {
        message: error.message || "Failed to update time entry",
        code: error.code || "UPDATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Create manual time entry
  async createManualEntry(entryData) {
    try {
      // For manual entries, we'll use the regular time entry creation
      // but mark it as manual and include start/end times
      const manualData = {
        ...entryData,
        isManual: true,
      };

      const response = await apiClient.post("/timer/entries", manualData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to create manual time entry");
      }
    } catch (error) {
      console.error("Error creating manual time entry:", error);
      throw {
        message: error.message || "Failed to create manual time entry",
        code: error.code || "CREATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Delete time entry
  async deleteTimeEntry(id) {
    try {
      const response = await apiClient.delete(`/timer/entries/${id}`);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to delete time entry");
      }
    } catch (error) {
      console.error("Error deleting time entry:", error);
      throw {
        message: error.message || "Failed to delete time entry",
        code: error.code || "DELETE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get projects and activities for timer selection
  async getProjectsAndActivities() {
    try {
      const response = await apiClient.get("/projects/processes-activities");

      if (response.success) {
        return response;
      } else {
        throw (
          response.error || new Error("Failed to fetch projects and activities")
        );
      }
    } catch (error) {
      console.error("Error fetching projects and activities:", error);
      throw {
        message: error.message || "Failed to fetch projects and activities",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get work projects for selection
  async getWorkProjects(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/projects${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch work projects");
      }
    } catch (error) {
      console.error("Error fetching work projects:", error);
      throw {
        message: error.message || "Failed to fetch work projects",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },
};
