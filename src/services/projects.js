// src/services/projects.js - Project management service
import { apiClient } from "./api";

export const projectService = {
  // Get all projects with optional filters
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/projects?${params.toString()}`);
      return response;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  // Get project by ID
  async getProject(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const response = await apiClient.post("/projects", projectData);
      return response;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId, projectData) {
    try {
      const response = await apiClient.put(
        `/projects/${projectId}`,
        projectData
      );
      return response;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`);
      return response;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
};
