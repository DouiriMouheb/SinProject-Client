// src/services/timer.js - FIXED version with proper data handling
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
      // Backend expects: workProjectId, activityId, taskName, description
      const cleanTimerData = {
        workProjectId: timerData.workProjectId,
        activityId: timerData.activityId,
        taskName: timerData.taskName || "",
        description: timerData.description || "",
      };

      const response = await apiClient.post("/timer/start", cleanTimerData);

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
      // Clean the data - only send fields that can be updated
      const updateData = {};

      if (entryData.taskName !== undefined) {
        updateData.taskName = entryData.taskName;
      }

      if (entryData.description !== undefined) {
        updateData.description = entryData.description;
      }

      if (entryData.startTime !== undefined) {
        updateData.startTime = entryData.startTime;
      }

      if (entryData.endTime !== undefined) {
        updateData.endTime = entryData.endTime;
      }

      const response = await apiClient.put(`/timer/entries/${id}`, updateData);

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

  // Create manual time entry - FIXED data transformation
  async createManualEntry(entryData) {
    try {
      // Transform frontend data to backend format
      const backendData = {
        workProjectId: entryData.workProjectId,
        activityId: entryData.activityId,
        taskName: entryData.taskName,
        description: entryData.description || "",
      };

      // Handle date/time transformation
      if (entryData.date && entryData.startTime && entryData.endTime) {
        // Frontend sends separate date and time, combine them
        backendData.startTime = new Date(
          `${entryData.date}T${entryData.startTime}`
        ).toISOString();
        backendData.endTime = new Date(
          `${entryData.date}T${entryData.endTime}`
        ).toISOString();
      } else if (entryData.startTime && entryData.endTime) {
        // Frontend already sends full datetime strings
        backendData.startTime = entryData.startTime;
        backendData.endTime = entryData.endTime;
      } else {
        throw new Error(
          "Start time and end time are required for manual entries"
        );
      }

      // Mark as manual
      backendData.isManual = true;

      const response = await apiClient.post("/timer/entries", backendData);

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

  // Delete time entry - NOW SUPPORTED
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

  // Helper method to validate time entry data before sending
  validateTimeEntryData(entryData) {
    const errors = [];

    if (!entryData.workProjectId) {
      errors.push("Work project is required");
    }

    if (!entryData.activityId) {
      errors.push("Activity is required");
    }

    if (!entryData.taskName || entryData.taskName.trim().length === 0) {
      errors.push("Task name is required");
    }

    if (entryData.taskName && entryData.taskName.trim().length < 2) {
      errors.push("Task name must be at least 2 characters");
    }

    // For manual entries
    if (
      entryData.isManual ||
      (entryData.date && entryData.startTime && entryData.endTime)
    ) {
      if (!entryData.date && (!entryData.startTime || !entryData.endTime)) {
        errors.push(
          "Date, start time, and end time are required for manual entries"
        );
      }

      if (entryData.date && entryData.startTime && entryData.endTime) {
        const start = new Date(`${entryData.date}T${entryData.startTime}`);
        const end = new Date(`${entryData.date}T${entryData.endTime}`);

        if (end <= start) {
          errors.push("End time must be after start time");
        }

        // Check for reasonable duration (not more than 24 hours)
        const diffHours = (end - start) / (1000 * 60 * 60);
        if (diffHours > 24) {
          errors.push("Duration cannot exceed 24 hours");
        }

        if (diffHours < 0.0167) {
          // Less than 1 minute
          errors.push("Duration must be at least 1 minute");
        }
      }

      // Check for future dates
      if (entryData.date) {
        const entryDate = new Date(entryData.date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (entryDate > today) {
          errors.push("Cannot create time entries for future dates");
        }
      }
    }

    return errors;
  },

  // Helper method to format duration for display
  formatDuration(minutes) {
    if (!minutes || minutes === 0) return "0 minutes";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? "s" : ""}`;
    } else if (mins === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      return `${hours}h ${mins}m`;
    }
  },

  // Helper method to calculate duration between two times
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;

    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMinutes = Math.max(0, (end - start) / (1000 * 60));
      return Math.round(diffMinutes);
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 0;
    }
  },
};
