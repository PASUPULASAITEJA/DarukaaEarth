export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

export interface GeoJSONFeatureProperties {
  id: string;
  name: string;
  description?: string;
  site_type: string;
  project_id: string;
  project_name?: string;
  project_type?: string;
  status?: string;
  area_hectares: number;
  area_km2: number;
  centroid_lat: number;
  centroid_lon: number;
  created_at?: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: GeoJSONGeometry;
  properties: GeoJSONFeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
