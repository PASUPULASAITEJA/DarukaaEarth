from typing import List, Optional

from pydantic import BaseModel

from app.schemas.project import ProjectOut
from app.schemas.site import GeoJSONFeatureCollection, SiteOut


class DashboardSummary(BaseModel):
    total_projects: int
    total_sites: int
    total_area_hectares: float
    total_area_km2: float
    carbon_projects_count: int
    biodiversity_projects_count: int
    combined_projects_count: int
    active_projects_count: int
    total_carbon_sequestered_tonnes: float
    average_biodiversity_score: float
    average_vegetation_coverage_pct: float
    recent_projects: List[ProjectOut]
    recent_sites: List[SiteOut]
    sites_geojson: Optional[GeoJSONFeatureCollection] = None
