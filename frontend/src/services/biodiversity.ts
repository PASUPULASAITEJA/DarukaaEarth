import { api } from './api';
import { SiteBiodiversityResponse, GBIFSpeciesRecord } from '../types';

export const biodiversityService = {
  async getSiteBiodiversity(siteId: string): Promise<SiteBiodiversityResponse> {
    const response = await api.get<SiteBiodiversityResponse>(`/biodiversity/sites/${siteId}/biodiversity`);
    return response.data;
  },

  async searchSpecies(query: string, limit: number = 10): Promise<GBIFSpeciesRecord[]> {
    const response = await api.get<GBIFSpeciesRecord[]>('/biodiversity/species/search', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
