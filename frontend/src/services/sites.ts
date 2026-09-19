import { api } from './api';
import { Site, SiteCreateInput } from '../types';
import { GeoJSONFeatureCollection } from '../types/geojson';

export const siteService = {
  async listSites(params?: { project_id?: string; site_type?: string; search?: string }): Promise<Site[]> {
    const response = await api.get<Site[]>('/sites', { params });
    return response.data;
  },

  async getAllSitesGeoJSON(projectId?: string): Promise<GeoJSONFeatureCollection> {
    const response = await api.get<GeoJSONFeatureCollection>('/sites/geojson/all', {
      params: projectId ? { project_id: projectId } : undefined,
    });
    return response.data;
  },

  async getSite(id: string): Promise<Site> {
    const response = await api.get<Site>(`/sites/${id}`);
    return response.data;
  },

  async createSite(data: SiteCreateInput): Promise<Site> {
    const response = await api.post<Site>('/sites', data);
    return response.data;
  },

  async updateSite(id: string, data: Partial<SiteCreateInput>): Promise<Site> {
    const response = await api.put<Site>(`/sites/${id}`, data);
    return response.data;
  },

  async deleteSite(id: string): Promise<void> {
    await api.delete(`/sites/${id}`);
  },
};
