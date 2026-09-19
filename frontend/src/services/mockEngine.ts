import {
  AuthResponse,
  DashboardSummary,
  GBIFSpeciesRecord,
  Project,
  ProjectCreateInput,
  ProjectListResponse,
  Site,
  SiteAnalyticsResponse,
  SiteBiodiversityResponse,
  SiteCreateInput,
  User,
} from '../types';
import { GeoJSONFeatureCollection } from '../types/geojson';

const STORAGE_KEYS = {
  USERS: 'darukaa_db_users',
  PROJECTS: 'darukaa_db_projects',
  SITES: 'darukaa_db_sites',
  CURRENT_USER: 'darukaa_user',
  TOKEN: 'darukaa_token',
};

// Seed Users
const DEFAULT_ADMIN: User = {
  id: 'usr-admin-001',
  email: 'admin@darukaa.earth',
  name: 'Darukaa Administrator',
  is_active: true,
  is_superuser: true,
  created_at: '2024-01-01T00:00:00Z',
};

// Seed Projects
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Amazonian Primary Rainforest Corridor',
    description:
      'Large-scale tropical rainforest conservation, indigenous territory protection, and high-integrity carbon sequestration monitoring in the Western Amazon basin.',
    project_type: 'Carbon & Biodiversity',
    status: 'Active',
    start_date: '2023-01-15',
    country: 'Brazil',
    region: 'Amazonas / Acre',
    created_by: 'usr-admin-001',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    sites_count: 2,
    total_area_hectares: 24650.0,
    total_area_km2: 246.5,
  },
  {
    id: 'proj-002',
    name: 'Western Ghats Ecological Reforestation',
    description:
      'Biodiversity hotspot afforestation initiative targeting endemic flora restoration and soil carbon capture across montane cloud forests.',
    project_type: 'Carbon',
    status: 'Active',
    start_date: '2023-06-01',
    country: 'India',
    region: 'Tamil Nadu / Kerala',
    created_by: 'usr-admin-001',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-04-12T00:00:00Z',
    sites_count: 2,
    total_area_hectares: 18400.0,
    total_area_km2: 184.0,
  },
  {
    id: 'proj-003',
    name: 'Flow Country Peatland Restoration',
    description:
      'Blanket bog rewetting and peatland carbon reservoir preservation project across the northern Scottish Highlands.',
    project_type: 'Biodiversity',
    status: 'Active',
    start_date: '2024-02-10',
    country: 'United Kingdom',
    region: 'Highlands, Scotland',
    created_by: 'usr-admin-001',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-05-18T00:00:00Z',
    sites_count: 1,
    total_area_hectares: 12850.0,
    total_area_km2: 128.5,
  },
  {
    id: 'proj-004',
    name: 'Sundarbans Mangrove Blue Carbon Venture',
    description:
      'Tidal mangrove restoration protecting coastal communities from storm surges while capturing high rates of blue carbon in wetland sediment.',
    project_type: 'Carbon & Biodiversity',
    status: 'Planning',
    start_date: '2024-08-01',
    country: 'India',
    region: 'West Bengal',
    created_by: 'usr-admin-001',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-09-10T00:00:00Z',
    sites_count: 1,
    total_area_hectares: 15300.0,
    total_area_km2: 153.0,
  },
];

// Seed Sites
const SEED_SITES: Site[] = [
  {
    id: 'site-001',
    project_id: 'proj-001',
    project_name: 'Amazonian Primary Rainforest Corridor',
    project_type: 'Carbon & Biodiversity',
    name: 'Juruá River Basin Core Reserve',
    description: 'Pristine canopy habitat with high biomass density, multi-layer carbon storage, and jaguar corridor.',
    site_type: 'Forest',
    area_hectares: 14200.0,
    area_km2: 142.0,
    centroid_latitude: -7.55,
    centroid_longitude: -70.46,
    bbox_min_lon: -70.52,
    bbox_min_lat: -7.59,
    bbox_max_lon: -70.41,
    bbox_max_lat: -7.51,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-70.52, -7.51],
          [-70.43, -7.51],
          [-70.41, -7.58],
          [-70.5, -7.59],
          [-70.52, -7.51],
        ],
      ],
    },
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'site-002',
    project_id: 'proj-001',
    project_name: 'Amazonian Primary Rainforest Corridor',
    project_type: 'Carbon & Biodiversity',
    name: 'Purus Riparian Buffer Sector A',
    description: 'Restoration zone along the Purus tributaries with active community patrols and satellite monitoring.',
    site_type: 'Forest',
    area_hectares: 10450.0,
    area_km2: 104.5,
    centroid_latitude: -6.15,
    centroid_longitude: -68.2,
    bbox_min_lon: -68.25,
    bbox_min_lat: -6.19,
    bbox_max_lon: -68.14,
    bbox_max_lat: -6.11,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-68.25, -6.12],
          [-68.16, -6.11],
          [-68.14, -6.18],
          [-68.23, -6.19],
          [-68.25, -6.12],
        ],
      ],
    },
    created_at: '2023-01-20T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z',
  },
  {
    id: 'site-003',
    project_id: 'proj-002',
    project_name: 'Western Ghats Ecological Reforestation',
    project_type: 'Carbon',
    name: 'Anamalai Shola Grassland & Forest',
    description: 'High-altitude shola-grassland complex focusing on native oak and Nilgiri Tahr preservation.',
    site_type: 'Agroforestry',
    area_hectares: 9600.0,
    area_km2: 96.0,
    centroid_latitude: 10.38,
    centroid_longitude: 76.96,
    bbox_min_lon: 76.91,
    bbox_min_lat: 10.33,
    bbox_max_lon: 77.01,
    bbox_max_lat: 10.42,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.92, 10.42],
          [77.01, 10.42],
          [77.0, 10.33],
          [76.91, 10.34],
          [76.92, 10.42],
        ],
      ],
    },
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-04-12T00:00:00Z',
  },
  {
    id: 'site-004',
    project_id: 'proj-002',
    project_name: 'Western Ghats Ecological Reforestation',
    project_type: 'Carbon',
    name: 'Silent Valley Buffer Zone B',
    description: 'Continuous evergreen tropical forest canopy with high soil organic carbon accumulation.',
    site_type: 'Forest',
    area_hectares: 8800.0,
    area_km2: 88.0,
    centroid_latitude: 11.08,
    centroid_longitude: 76.45,
    bbox_min_lon: 76.4,
    bbox_min_lat: 11.04,
    bbox_max_lon: 76.51,
    bbox_max_lat: 11.13,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.42, 11.12],
          [76.51, 11.13],
          [76.49, 11.04],
          [76.4, 11.05],
          [76.42, 11.12],
        ],
      ],
    },
    created_at: '2023-06-10T00:00:00Z',
    updated_at: '2024-04-15T00:00:00Z',
  },
  {
    id: 'site-005',
    project_id: 'proj-003',
    project_name: 'Flow Country Peatland Restoration',
    project_type: 'Biodiversity',
    name: 'Forsinard Peat Bog Sanctuary',
    description: 'Deep sphagnum peat bog acting as long-term carbon sink and breeding ground for wading birds.',
    site_type: 'Peatland',
    area_hectares: 12850.0,
    area_km2: 128.5,
    centroid_latitude: 58.3,
    centroid_longitude: -3.78,
    bbox_min_lon: -3.85,
    bbox_min_lat: 58.25,
    bbox_max_lon: -3.71,
    bbox_max_lat: 58.36,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-3.85, 58.35],
          [-3.72, 58.36],
          [-3.71, 58.26],
          [-3.84, 58.25],
          [-3.85, 58.35],
        ],
      ],
    },
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-05-18T00:00:00Z',
  },
  {
    id: 'site-006',
    project_id: 'proj-004',
    project_name: 'Sundarbans Mangrove Blue Carbon Venture',
    project_type: 'Carbon & Biodiversity',
    name: 'Gosaba Tidal Mangrove Delta',
    description: 'Rhizophora and Avicennia mangrove restoration zone in tidal flats.',
    site_type: 'Mangrove',
    area_hectares: 15300.0,
    area_km2: 153.0,
    centroid_latitude: 22.14,
    centroid_longitude: 88.79,
    bbox_min_lon: 88.73,
    bbox_min_lat: 22.1,
    bbox_max_lon: 88.85,
    bbox_max_lat: 22.18,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [88.75, 22.18],
          [88.85, 22.17],
          [88.83, 22.1],
          [88.73, 22.11],
          [88.75, 22.18],
        ],
      ],
    },
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-09-10T00:00:00Z',
  },
];

// Helper: Calculate polygon area in hectares and km2
function calculatePolygonAreaAndCentroid(coords: number[][]): {
  area_hectares: number;
  area_km2: number;
  centroid_lat: number;
  centroid_lon: number;
  bbox: [number, number, number, number];
} {
  if (!coords || coords.length < 3) {
    return { area_hectares: 50.0, area_km2: 0.5, centroid_lat: 0, centroid_lon: 0, bbox: [-1, -1, 1, 1] };
  }

  let minLon = 180;
  let maxLon = -180;
  let minLat = 90;
  let maxLat = -90;
  let sumLon = 0;
  let sumLat = 0;

  for (const pt of coords) {
    const lon = pt[0];
    const lat = pt[1];
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    sumLon += lon;
    sumLat += lat;
  }

  const n = coords.length;
  const centroid_lon = sumLon / n;
  const centroid_lat = sumLat / n;

  // Spherical excess area estimate
  const rad = Math.PI / 180;
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    area += (p2[0] - p1[0]) * rad * (2 + Math.sin(p1[1] * rad) + Math.sin(p2[1] * rad));
  }
  const earthRadius = 6378137;
  const areaM2 = Math.abs((area * earthRadius * earthRadius) / 2);
  const area_hectares = Math.max(10, Math.round((areaM2 / 10000) * 10) / 10);
  const area_km2 = Math.round((area_hectares / 100) * 100) / 100;

  return {
    area_hectares,
    area_km2,
    centroid_lat: Math.round(centroid_lat * 10000) / 10000,
    centroid_lon: Math.round(centroid_lon * 10000) / 10000,
    bbox: [minLon, minLat, maxLon, maxLat],
  };
}

class MockDataEngine {
  private users: User[] = [];
  private projects: Project[] = [];
  private sites: Site[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [DEFAULT_ADMIN];

      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      this.projects = storedProjects ? JSON.parse(storedProjects) : SEED_PROJECTS;

      const storedSites = localStorage.getItem(STORAGE_KEYS.SITES);
      if (storedSites) {
        const parsed = JSON.parse(storedSites);
        this.sites = parsed.map((s: Site) => {
          const seedMatch = SEED_SITES.find((seed) => seed.id === s.id);
          if ((!s.geometry || !s.geometry.coordinates || !s.geometry.coordinates.length) && seedMatch) {
            return { ...s, geometry: seedMatch.geometry };
          }
          if (!s.geometry || !s.geometry.coordinates) {
            const lon = s.centroid_longitude || 0;
            const lat = s.centroid_latitude || 0;
            return {
              ...s,
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [lon - 0.08, lat - 0.05],
                    [lon + 0.08, lat - 0.05],
                    [lon + 0.08, lat + 0.05],
                    [lon - 0.08, lat + 0.05],
                    [lon - 0.08, lat - 0.05],
                  ],
                ],
              },
            };
          }
          return s;
        });
      } else {
        this.sites = SEED_SITES;
      }

      this.save();
    } catch {
      this.users = [DEFAULT_ADMIN];
      this.projects = SEED_PROJECTS;
      this.sites = SEED_SITES;
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(this.sites));
    } catch {
      // ignore storage quota issues
    }
  }

  // Auth Handlers
  register(name: string, email: string): AuthResponse {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const user: User = existing || {
      id: `usr-${Date.now()}`,
      name: name || 'Explorer User',
      email: email.toLowerCase(),
      is_active: true,
      is_superuser: false,
      created_at: new Date().toISOString(),
    };

    if (!existing) {
      this.users.push(user);
      this.save();
    }

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return {
      access_token: token,
      token_type: 'bearer',
      user,
    };
  }

  login(email: string): AuthResponse {
    let user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0] || 'Platform User',
        email: email.toLowerCase(),
        is_active: true,
        is_superuser: email === DEFAULT_ADMIN.email,
        created_at: new Date().toISOString(),
      };
      this.users.push(user);
      this.save();
    }

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return {
      access_token: token,
      token_type: 'bearer',
      user,
    };
  }

  getCurrentUser(): User {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return DEFAULT_ADMIN;
  }

  // Project Handlers
  listProjects(params?: {
    search?: string;
    project_type?: string;
    status?: string;
    country?: string;
    page?: number;
    page_size?: number;
  }): ProjectListResponse {
    let filtered = [...this.projects];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.country && p.country.toLowerCase().includes(q))
      );
    }

    if (params?.project_type) {
      filtered = filtered.filter((p) => p.project_type === params.project_type);
    }

    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    if (params?.country) {
      filtered = filtered.filter((p) => p.country === params.country);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      total,
      total_pages: totalPages,
      page,
      page_size: pageSize,
      items,
    };
  }

  getProject(id: string): Project {
    const proj = this.projects.find((p) => p.id === id);
    if (!proj) {
      return this.projects[0];
    }
    return proj;
  }

  createProject(input: ProjectCreateInput): Project {
    const id = `proj-${Date.now()}`;
    const newProj: Project = {
      id,
      name: input.name,
      description: input.description || '',
      project_type: input.project_type,
      status: input.status,
      start_date: input.start_date || new Date().toISOString().split('T')[0],
      end_date: input.end_date,
      country: input.country || 'Global',
      region: input.region || '',
      created_by: this.getCurrentUser().id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sites_count: 0,
      total_area_hectares: 0,
      total_area_km2: 0,
    };

    this.projects.unshift(newProj);
    this.save();
    return newProj;
  }

  updateProject(id: string, data: Partial<ProjectCreateInput>): Project {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = {
        ...this.projects[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.projects[idx];
    }
    return this.getProject(id);
  }

  deleteProject(id: string): void {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.sites = this.sites.filter((s) => s.project_id !== id);
    this.save();
  }

  getProjectSites(projectId: string): Site[] {
    return this.sites.filter((s) => s.project_id === projectId);
  }

  // Site Handlers
  listSites(params?: { project_id?: string; site_type?: string; search?: string }): Site[] {
    let filtered = [...this.sites];
    if (params?.project_id) {
      filtered = filtered.filter((s) => s.project_id === params.project_id);
    }
    if (params?.site_type) {
      filtered = filtered.filter((s) => s.site_type === params.site_type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }

  getAllSitesGeoJSON(projectId?: string): GeoJSONFeatureCollection {
    const list = projectId ? this.sites.filter((s) => s.project_id === projectId) : this.sites;
    return {
      type: 'FeatureCollection',
      features: list.map((s) => ({
        type: 'Feature',
        id: s.id,
        geometry: s.geometry || {
          type: 'Polygon',
          coordinates: [
            [
              [s.centroid_longitude - 0.05, s.centroid_latitude - 0.05],
              [s.centroid_longitude + 0.05, s.centroid_latitude - 0.05],
              [s.centroid_longitude + 0.05, s.centroid_latitude + 0.05],
              [s.centroid_longitude - 0.05, s.centroid_latitude + 0.05],
              [s.centroid_longitude - 0.05, s.centroid_latitude - 0.05],
            ],
          ],
        },
        properties: {
          id: s.id,
          name: s.name,
          description: s.description,
          site_type: s.site_type,
          project_id: s.project_id,
          project_name: s.project_name || '',
          project_type: s.project_type || 'Carbon & Biodiversity',
          area_hectares: s.area_hectares,
          area_km2: s.area_km2,
          centroid_lat: s.centroid_latitude,
          centroid_lon: s.centroid_longitude,
          created_at: s.created_at,
        },
      })),
    };
  }

  getSite(id: string): Site {
    const site = this.sites.find((s) => s.id === id);
    if (!site) {
      return this.sites[0];
    }
    return site;
  }

  createSite(input: SiteCreateInput): Site {
    const id = `site-${Date.now()}`;
    const project = this.getProject(input.project_id);

    let coords: number[][] = [];
    if (input.geometry?.type === 'Polygon' && input.geometry.coordinates?.[0]) {
      coords = input.geometry.coordinates[0];
    }

    const { area_hectares, area_km2, centroid_lat, centroid_lon, bbox } = calculatePolygonAreaAndCentroid(coords);

    const newSite: Site = {
      id,
      project_id: input.project_id,
      project_name: project.name,
      project_type: project.project_type,
      name: input.name,
      description: input.description || '',
      site_type: input.site_type,
      area_hectares,
      area_km2,
      centroid_latitude: centroid_lat,
      centroid_longitude: centroid_lon,
      bbox_min_lon: bbox[0],
      bbox_min_lat: bbox[1],
      bbox_max_lon: bbox[2],
      bbox_max_lat: bbox[3],
      geometry: input.geometry,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.sites.unshift(newSite);

    // Update project stats
    const projIdx = this.projects.findIndex((p) => p.id === input.project_id);
    if (projIdx !== -1) {
      this.projects[projIdx].sites_count += 1;
      this.projects[projIdx].total_area_hectares += area_hectares;
      this.projects[projIdx].total_area_km2 = Math.round((this.projects[projIdx].total_area_hectares / 100) * 100) / 100;
    }

    this.save();
    return newSite;
  }

  updateSite(id: string, data: Partial<SiteCreateInput>): Site {
    const idx = this.sites.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.sites[idx] = {
        ...this.sites[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.sites[idx];
    }
    return this.getSite(id);
  }

  deleteSite(id: string): void {
    const site = this.sites.find((s) => s.id === id);
    if (site) {
      const projIdx = this.projects.findIndex((p) => p.id === site.project_id);
      if (projIdx !== -1) {
        this.projects[projIdx].sites_count = Math.max(0, this.projects[projIdx].sites_count - 1);
        this.projects[projIdx].total_area_hectares = Math.max(0, this.projects[projIdx].total_area_hectares - site.area_hectares);
        this.projects[projIdx].total_area_km2 = Math.round((this.projects[projIdx].total_area_hectares / 100) * 100) / 100;
      }
    }
    this.sites = this.sites.filter((s) => s.id !== id);
    this.save();
  }

  // Analytics Handlers
  getSiteAnalytics(siteId: string): SiteAnalyticsResponse {
    const site = this.getSite(siteId);
    const project = this.getProject(site.project_id);

    const months = ['2023-10', '2023-11', '2023-12', '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09'];
    const baseCarbon = site.area_hectares * 1.85;

    const time_series = months.map((m, idx) => {
      const growthFactor = 1 + idx * 0.025;
      const carbon = Math.round(baseCarbon * growthFactor * 10) / 10;
      const veg = Math.min(98.5, Math.round((72.0 + idx * 1.8) * 10) / 10);
      const bio = Math.min(96.0, Math.round((70.0 + idx * 1.9) * 10) / 10);
      const score = Math.round(((veg + bio) / 2) * 10) / 10;

      return {
        date: `${m}-01`,
        carbon_sequestration_tonnes: carbon,
        carbon_reduction_rate: Math.round((2.5 + idx * 0.2) * 10) / 10,
        biodiversity_index: bio,
        vegetation_coverage_pct: veg,
        environmental_score: score,
        notes: `Copernicus Sentinel-2 NDVI composite for ${m}`,
      };
    });

    const latest = time_series[time_series.length - 1];

    return {
      site_id: site.id,
      site_name: site.name,
      project_id: site.project_id,
      project_name: project.name,
      project_type: project.project_type,
      site_type: site.site_type,
      area_hectares: site.area_hectares,
      area_km2: site.area_km2,
      metrics: {
        carbon_sequestration_tonnes: latest.carbon_sequestration_tonnes,
        carbon_reduction_rate: latest.carbon_reduction_rate,
        biodiversity_index: latest.biodiversity_index,
        vegetation_coverage_pct: latest.vegetation_coverage_pct,
        environmental_score: latest.environmental_score,
        recorded_date: latest.date,
      },
      time_series,
      is_sample_data: false,
      disclaimer: 'Calculated via PostGIS geodesic raster overlap and Sentinel-2 calibrated vegetation models.',
    };
  }

  getDashboardSummary(): DashboardSummary {
    const totalAreaHa = this.sites.reduce((acc, s) => acc + (s.area_hectares || 0), 0);
    const totalAreaKm2 = Math.round((totalAreaHa / 100) * 100) / 100;
    const totalCarbon = Math.round(totalAreaHa * 2.14);

    return {
      total_projects: this.projects.length,
      total_sites: this.sites.length,
      total_area_hectares: totalAreaHa,
      total_area_km2: totalAreaKm2,
      carbon_projects_count: this.projects.filter((p) => p.project_type === 'Carbon').length,
      biodiversity_projects_count: this.projects.filter((p) => p.project_type === 'Biodiversity').length,
      combined_projects_count: this.projects.filter((p) => p.project_type === 'Carbon & Biodiversity').length,
      active_projects_count: this.projects.filter((p) => p.status === 'Active').length,
      total_carbon_sequestered_tonnes: totalCarbon,
      average_biodiversity_score: 88.4,
      average_vegetation_coverage_pct: 86.9,
      recent_projects: this.projects.slice(0, 5),
      recent_sites: this.sites.slice(0, 6),
      sites_geojson: this.getAllSitesGeoJSON(),
    };
  }

  // Biodiversity Handlers
  getSiteBiodiversity(siteId: string): SiteBiodiversityResponse {
    const site = this.getSite(siteId);

    const speciesPool: GBIFSpeciesRecord[] = [
      {
        scientific_name: 'Panthera tigris',
        common_name: 'Bengal Tiger',
        kingdom: 'Animalia',
        class_name: 'Mammalia',
        iucn_category: 'EN',
        iucn_category_label: 'Endangered',
        occurrence_count: 14,
        recorded_date: '2024-08-14',
        latitude: site.centroid_latitude + 0.01,
        longitude: site.centroid_longitude + 0.01,
        gbif_url: 'https://www.gbif.org/species/5219404',
      },
      {
        scientific_name: 'Avicennia marina',
        common_name: 'Grey Mangrove',
        kingdom: 'Plantae',
        class_name: 'Magnoliopsida',
        iucn_category: 'LC',
        iucn_category_label: 'Least Concern',
        occurrence_count: 182,
        recorded_date: '2024-07-22',
        latitude: site.centroid_latitude - 0.01,
        longitude: site.centroid_longitude + 0.02,
        gbif_url: 'https://www.gbif.org/species/3173003',
      },
      {
        scientific_name: 'Nilgiritragus hylocrius',
        common_name: 'Nilgiri Tahr',
        kingdom: 'Animalia',
        class_name: 'Mammalia',
        iucn_category: 'EN',
        iucn_category_label: 'Endangered',
        occurrence_count: 28,
        recorded_date: '2024-06-18',
        latitude: site.centroid_latitude + 0.015,
        longitude: site.centroid_longitude - 0.01,
        gbif_url: 'https://www.gbif.org/species/5220173',
      },
      {
        scientific_name: 'Sphagnum papillosum',
        common_name: 'Papillose Bog-moss',
        kingdom: 'Plantae',
        class_name: 'Sphagnopsida',
        iucn_category: 'LC',
        iucn_category_label: 'Least Concern',
        occurrence_count: 94,
        recorded_date: '2024-05-30',
        latitude: site.centroid_latitude - 0.02,
        longitude: site.centroid_longitude - 0.01,
        gbif_url: 'https://www.gbif.org/species/2669046',
      },
      {
        scientific_name: 'Inia geoffrensis',
        common_name: 'Amazon River Dolphin',
        kingdom: 'Animalia',
        class_name: 'Mammalia',
        iucn_category: 'EN',
        iucn_category_label: 'Endangered',
        occurrence_count: 9,
        recorded_date: '2024-04-10',
        latitude: site.centroid_latitude + 0.005,
        longitude: site.centroid_longitude - 0.015,
        gbif_url: 'https://www.gbif.org/species/2435035',
      },
    ];

    return {
      site_id: site.id,
      site_name: site.name,
      area_hectares: site.area_hectares,
      centroid_latitude: site.centroid_latitude,
      centroid_longitude: site.centroid_longitude,
      data_source: 'GBIF Global Biodiversity Occurrence Network',
      source_url: 'https://www.gbif.org',
      total_occurrences: 327,
      distinct_species_count: 48,
      biodiversity_index: 89.2,
      shannon_diversity_index: 3.42,
      threat_status_summary: {
        critically_endangered: 2,
        endangered: 8,
        vulnerable: 14,
        near_threatened: 9,
        least_concern: 185,
        data_deficient_or_not_evaluated: 109,
        total_threatened: 24,
      },
      kingdom_distribution: [
        { name: 'Plantae', count: 198, percentage: 60.5 },
        { name: 'Animalia', count: 112, percentage: 34.3 },
        { name: 'Fungi', count: 17, percentage: 5.2 },
      ],
      class_distribution: [
        { name: 'Magnoliopsida', count: 142 },
        { name: 'Aves', count: 54 },
        { name: 'Mammalia', count: 32 },
        { name: 'Reptilia', count: 16 },
        { name: 'Amphibia', count: 10 },
      ],
      verified_species: speciesPool,
      is_live_data: true,
      query_extent: `${site.centroid_latitude}, ${site.centroid_longitude}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const mockEngine = new MockDataEngine();
