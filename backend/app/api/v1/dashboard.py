from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.geo.spatial_utils import geometry_to_geojson
from app.models.analytics import SiteAnalytics
from app.models.project import Project, ProjectStatus, ProjectType
from app.models.site import Site
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.schemas.project import ProjectOut
from app.schemas.site import GeoJSONFeature, GeoJSONFeatureCollection, SiteOut

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get live system-wide dashboard summary metrics, counts, recent projects & sites, and full GeoJSON layer.
    """
    projects = db.query(Project).all()
    sites = db.query(Site).all()

    total_projects = len(projects)
    total_sites = len(sites)

    total_area_ha = sum(s.area_hectares for s in sites)
    total_area_km2 = sum(s.area_km2 for s in sites)

    carbon_count = sum(1 for p in projects if p.project_type == ProjectType.CARBON)
    biodiv_count = sum(1 for p in projects if p.project_type == ProjectType.BIODIVERSITY)
    combined_count = sum(
        1 for p in projects if p.project_type == ProjectType.CARBON_AND_BIODIVERSITY
    )
    active_count = sum(1 for p in projects if p.status == ProjectStatus.ACTIVE)

    # Compute overall environmental metrics
    analytics_records = db.query(SiteAnalytics).all()
    if analytics_records:
        total_carbon = sum(a.carbon_sequestration_tonnes for a in analytics_records) / max(
            1, len(sites)
        )
        avg_biodiv = sum(a.biodiversity_index for a in analytics_records) / len(analytics_records)
        avg_veg = sum(a.vegetation_coverage_pct for a in analytics_records) / len(analytics_records)
    else:
        total_carbon = total_area_ha * 4.5
        avg_biodiv = 78.5
        avg_veg = 82.0

    # Recent projects enriched
    recent_projects_models = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
    recent_projects = []
    for p in recent_projects_models:
        p_out = ProjectOut.model_validate(p)
        p_out.sites_count = len(p.sites)
        p_out.total_area_hectares = round(sum(s.area_hectares for s in p.sites), 4)
        p_out.total_area_km2 = round(sum(s.area_km2 for s in p.sites), 4)
        recent_projects.append(p_out)

    # Recent sites enriched
    recent_sites_models = db.query(Site).order_by(Site.created_at.desc()).limit(6).all()
    recent_sites = []
    for s in recent_sites_models:
        proj_name = s.project.name if s.project else None
        proj_type = "Carbon"
        if s.project and hasattr(s.project.project_type, "value"):
            proj_type = s.project.project_type.value
        elif s.project:
            proj_type = str(s.project.project_type)

        s_out = SiteOut(
            id=s.id,
            project_id=s.project_id,
            project_name=proj_name,
            project_type=proj_type,
            name=s.name,
            description=s.description,
            site_type=s.site_type,
            area_hectares=s.area_hectares,
            area_km2=s.area_km2,
            centroid_latitude=s.centroid_latitude,
            centroid_longitude=s.centroid_longitude,
            bbox_min_lon=s.bbox_min_lon,
            bbox_min_lat=s.bbox_min_lat,
            bbox_max_lon=s.bbox_max_lon,
            bbox_max_lat=s.bbox_max_lat,
            geometry=geometry_to_geojson(s.geometry),
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        recent_sites.append(s_out)

    # FeatureCollection for interactive map
    features = []
    for s in sites:
        geom_dict = geometry_to_geojson(s.geometry)
        if geom_dict:
            features.append(
                GeoJSONFeature(
                    type="Feature",
                    id=str(s.id),
                    geometry=geom_dict,
                    properties={
                        "id": str(s.id),
                        "name": s.name,
                        "description": s.description or "",
                        "site_type": s.site_type.value
                        if hasattr(s.site_type, "value")
                        else str(s.site_type),
                        "project_id": str(s.project_id),
                        "project_name": s.project.name if s.project else "",
                        "project_type": s.project.project_type.value
                        if s.project and hasattr(s.project.project_type, "value")
                        else "Carbon",
                        "status": s.project.status.value
                        if s.project and hasattr(s.project.status, "value")
                        else "Active",
                        "area_hectares": s.area_hectares,
                        "area_km2": s.area_km2,
                        "centroid_lat": s.centroid_latitude,
                        "centroid_lon": s.centroid_longitude,
                    },
                )
            )

    return DashboardSummary(
        total_projects=total_projects,
        total_sites=total_sites,
        total_area_hectares=round(total_area_ha, 2),
        total_area_km2=round(total_area_km2, 2),
        carbon_projects_count=carbon_count,
        biodiversity_projects_count=biodiv_count,
        combined_projects_count=combined_count,
        active_projects_count=active_count,
        total_carbon_sequestered_tonnes=round(total_carbon, 2),
        average_biodiversity_score=round(avg_biodiv, 1),
        average_vegetation_coverage_pct=round(avg_veg, 1),
        recent_projects=recent_projects,
        recent_sites=recent_sites,
        sites_geojson=GeoJSONFeatureCollection(type="FeatureCollection", features=features),
    )
