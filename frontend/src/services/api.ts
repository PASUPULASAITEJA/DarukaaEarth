import axios, { AxiosRequestConfig } from 'axios';
import { mockEngine } from './mockEngine';

const isProductionStaticDeploy =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? '/api/v1'
    : 'http://localhost:8000/api/v1');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: isProductionStaticDeploy ? 1500 : 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: Dispatch client-side mock/fallback request
function dispatchMock(config: AxiosRequestConfig): any {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  let data: any = config.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // ignore
    }
  }

  // 1. Auth routes
  if (url.includes('/auth/register')) {
    return mockEngine.register(data?.name || 'Explorer User', data?.email || 'user@darukaa.earth');
  }
  if (url.includes('/auth/login')) {
    return mockEngine.login(data?.email || 'admin@darukaa.earth');
  }
  if (url.includes('/auth/me')) {
    return mockEngine.getCurrentUser();
  }

  // 2. Dashboard summary
  if (url.includes('/dashboard/summary')) {
    return mockEngine.getDashboardSummary();
  }

  // 3. Site Analytics
  const analyticsMatch = url.match(/\/sites\/([^/]+)\/analytics/);
  if (analyticsMatch) {
    return mockEngine.getSiteAnalytics(analyticsMatch[1]);
  }

  // 4. Site Biodiversity & Species
  const bioMatch = url.match(/\/biodiversity\/sites\/([^/]+)\/biodiversity/);
  if (bioMatch) {
    return mockEngine.getSiteBiodiversity(bioMatch[1]);
  }
  if (url.includes('/biodiversity/species/search')) {
    return [
      {
        scientific_name: 'Panthera tigris',
        common_name: 'Bengal Tiger',
        kingdom: 'Animalia',
        class_name: 'Mammalia',
        iucn_category: 'EN',
        occurrence_count: 14,
      },
      {
        scientific_name: 'Avicennia marina',
        common_name: 'Grey Mangrove',
        kingdom: 'Plantae',
        class_name: 'Magnoliopsida',
        iucn_category: 'LC',
        occurrence_count: 182,
      },
    ];
  }

  // 5. Sites GeoJSON
  if (url.includes('/sites/geojson/all')) {
    return mockEngine.getAllSitesGeoJSON(config.params?.project_id);
  }

  // 6. Project Sites
  const projSitesMatch = url.match(/\/projects\/([^/]+)\/sites/);
  if (projSitesMatch) {
    return mockEngine.getProjectSites(projSitesMatch[1]);
  }

  // 7. Projects CRUD
  const singleProjMatch = url.match(/\/projects\/([^/]+)$/);
  if (singleProjMatch) {
    const pId = singleProjMatch[1];
    if (method === 'put') return mockEngine.updateProject(pId, data);
    if (method === 'delete') {
      mockEngine.deleteProject(pId);
      return { success: true };
    }
    return mockEngine.getProject(pId);
  }
  if (url.includes('/projects')) {
    if (method === 'post') return mockEngine.createProject(data);
    return mockEngine.listProjects(config.params);
  }

  // 8. Sites CRUD
  const singleSiteMatch = url.match(/\/sites\/([^/]+)$/);
  if (singleSiteMatch) {
    const sId = singleSiteMatch[1];
    if (method === 'put') return mockEngine.updateSite(sId, data);
    if (method === 'delete') {
      mockEngine.deleteSite(sId);
      return { success: true };
    }
    return mockEngine.getSite(sId);
  }
  if (url.includes('/sites')) {
    if (method === 'post') return mockEngine.createSite(data);
    return mockEngine.listSites(config.params);
  }

  return { success: true };
}

// Request Interceptor: Attach JWT Token or instant mock for static cloud deploy
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('darukaa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isProductionStaticDeploy) {
      // In static production deployments without a backend host, handle seamlessly
      const mockResult = dispatchMock(config);
      return Promise.resolve({
        ...config,
        adapter: async () => ({
          data: mockResult,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Fallback to mock on network failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is offline or network error on deployed site, fallback seamlessly
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const mockResult = dispatchMock(error.config || {});
      return Promise.resolve({
        data: mockResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('darukaa_token');
      localStorage.removeItem('darukaa_user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);
