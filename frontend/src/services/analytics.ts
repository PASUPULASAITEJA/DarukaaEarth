import { api } from './api';
import { SiteAnalyticsResponse, DashboardSummary } from '../types';

export const analyticsService = {
  async getSiteAnalytics(siteId: string): Promise<SiteAnalyticsResponse> {
    const response = await api.get<SiteAnalyticsResponse>(`/sites/${siteId}/analytics`);
    return response.data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
};
