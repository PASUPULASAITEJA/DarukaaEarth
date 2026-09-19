import { api } from './api';
import { Project, ProjectCreateInput, ProjectListResponse, Site } from '../types';

export interface ProjectFilterParams {
  search?: string;
  project_type?: string;
  status?: string;
  country?: string;
  page?: number;
  page_size?: number;
}

export const projectService = {
  async listProjects(params?: ProjectFilterParams): Promise<ProjectListResponse> {
    const response = await api.get<ProjectListResponse>('/projects', { params });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: ProjectCreateInput): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<ProjectCreateInput>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getProjectSites(id: string): Promise<Site[]> {
    const response = await api.get<Site[]>(`/projects/${id}/sites`);
    return response.data;
  },
};
