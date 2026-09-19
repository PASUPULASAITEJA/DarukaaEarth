import { GeoJSONFeatureCollection, GeoJSONGeometry } from './geojson';

export type ProjectType = 'Carbon' | 'Biodiversity' | 'Carbon & Biodiversity';
export type ProjectStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';
export type SiteType =
  | 'Forest'
  | 'Peatland'
  | 'Wetland'
  | 'Grassland'
  | 'Mangrove'
  | 'Agroforestry'
  | 'Marine'
  | 'Savanna'
  | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  country?: string;
  region?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  sites_count: number;
  total_area_hectares: number;
  total_area_km2: number;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  country?: string;
  region?: string;
}

export interface ProjectListResponse {
  total: number;
  items: Project[];
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Site {
  id: string;
  project_id: string;
  project_name?: string;
  project_type?: string;
  name: string;
  description?: string;
  site_type: SiteType;
  area_hectares: number;
  area_km2: number;
  centroid_latitude: number;
  centroid_longitude: number;
  bbox_min_lon?: number;
  bbox_min_lat?: number;
  bbox_max_lon?: number;
  bbox_max_lat?: number;
  geometry?: GeoJSONGeometry;
  created_at: string;
  updated_at: string;
}

export interface SiteCreateInput {
  project_id: string;
  name: string;
  description?: string;
  site_type: SiteType;
  geometry: any;
}

export interface CurrentMetrics {
  carbon_sequestration_tonnes: number;
  carbon_reduction_rate: number;
  biodiversity_index: number;
  vegetation_coverage_pct: number;
  environmental_score: number;
  recorded_date?: string;
}

export interface AnalyticsRecord {
  date: string;
  carbon_sequestration_tonnes: number;
  carbon_reduction_rate: number;
  biodiversity_index: number;
  vegetation_coverage_pct: number;
  environmental_score: number;
  notes?: string;
}

export interface SiteAnalyticsResponse {
  site_id: string;
  site_name: string;
  project_id: string;
  project_name: string;
  project_type: string;
  site_type: string;
  area_hectares: number;
  area_km2: number;
  metrics: CurrentMetrics;
  time_series: AnalyticsRecord[];
  is_sample_data: boolean;
  disclaimer: string;
}

export interface DashboardSummary {
  total_projects: number;
  total_sites: number;
  total_area_hectares: number;
  total_area_km2: number;
  carbon_projects_count: number;
  biodiversity_projects_count: number;
  combined_projects_count: number;
  active_projects_count: number;
  total_carbon_sequestered_tonnes: number;
  average_biodiversity_score: number;
  average_vegetation_coverage_pct: number;
  recent_projects: Project[];
  recent_sites: Site[];
  sites_geojson?: GeoJSONFeatureCollection;
}

export interface TaxonCount {
  name: string;
  count: number;
  percentage?: number;
}

export interface IUCNStatusSummary {
  critically_endangered: number;
  endangered: number;
  vulnerable: number;
  near_threatened: number;
  least_concern: number;
  data_deficient_or_not_evaluated: number;
  total_threatened: number;
}

export interface GBIFSpeciesRecord {
  gbif_id?: string;
  scientific_name: string;
  canonical_name?: string;
  common_name?: string;
  kingdom?: string;
  class?: string;
  class_name?: string;
  order?: string;
  family?: string;
  genus?: string;
  iucn_category?: 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD' | 'NE' | string;
  iucn_category_label?: string;
  occurrence_count: number;
  recorded_date?: string;
  image_url?: string;
  license?: string;
  latitude?: number;
  longitude?: number;
  gbif_url?: string;
}

export interface SiteBiodiversityResponse {
  site_id: string;
  site_name: string;
  area_hectares: number;
  centroid_latitude: number;
  centroid_longitude: number;
  data_source: string;
  source_url: string;
  total_occurrences: number;
  distinct_species_count: number;
  biodiversity_index: number;
  shannon_diversity_index: number;
  threat_status_summary: IUCNStatusSummary;
  kingdom_distribution: TaxonCount[];
  class_distribution: TaxonCount[];
  verified_species: GBIFSpeciesRecord[];
  is_live_data: boolean;
  query_extent: string;
  timestamp: string;
}

