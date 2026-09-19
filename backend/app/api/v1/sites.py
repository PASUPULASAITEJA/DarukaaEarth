from datetime import date, timedelta
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from geoalchemy2.shape import from_shape
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.geo.spatial_utils import (
    geometry_to_geojson,
    validate_and_process_geojson,
)
from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site, SiteType
from app.models.user import User
from app.schemas.site import (
    GeoJSONFeature,
    GeoJSONFeatureCollection,
    SiteCreate,
    SiteOut,
    SiteUpdate,
)

router = APIRouter()


def _format_site_out(site: Site) -> SiteOut:
    """Helper to format a Site SQLAlchemy model into a SiteOut schema with converted GeoJSON geometry."""
    proj_name = site.project.name if site.project else None
    proj_type = "Carbon"
    if site.project and hasattr(site.project.project_type, "value"):
        proj_type = site.project.project_type.value
    elif site.project:
        proj_type = str(site.project.project_type)

    return SiteOut(
        id=site.id,
        project_id=site.project_id,
        project_name=proj_name,
        project_type=proj_type,
        name=site.name,
        description=site.description,
        site_type=site.site_type,
        area_hectares=site.area_hectares,
        area_km2=site.area_km2,
        centroid_latitude=site.centroid_latitude,
        centroid_longitude=site.centroid_longitude,
        bbox_min_lon=site.bbox_min_lon,
        bbox_min_lat=site.bbox_min_lat,
        bbox_max_lon=site.bbox_max_lon,
        bbox_max_lat=site.bbox_max_lat,
        geometry=geometry_to_geojson(site.geometry),
        created_at=site.created_at,
        updated_at=site.updated_at,
    )


def _generate_initial_seed_analytics(site: Site, db: Session):
    """Generate realistic initial demo time-series data for the newly created site."""
    today = date.today()
    base_carbon = max(15.0, site.area_hectares * 4.2)
    base_biodiversity = 68.0
    base_vegetation = 72.0

    for i in range(6, -1, -1):
        rec_date = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        growth_factor = (6 - i) * 0.04
        carbon_val = round(base_carbon * (0.85 + growth_factor), 2)
        biodiv_val = min(98.0, round(base_biodiversity + (6 - i) * 1.8, 1))
        veg_val = min(99.0, round(base_vegetation + (6 - i) * 1.5, 1))
        env_score = round((biodiv_val * 0.45) + (veg_val * 0.35) + min(20.0, carbon_val / 50.0), 1)

        analytics_rec = SiteAnalytics(
            site_id=site.id,
            recorded_date=rec_date,
            carbon_sequestration_tonnes=carbon_val,
            carbon_reduction_rate=round(8.5 + (6 - i) * 0.9, 1),
            biodiversity_index=biodiv_val,
            vegetation_coverage_pct=veg_val,
            environmental_score=env_score,
            is_sample_data=True,
            notes="Initial automated baseline estimate from geospatial geometry parameters.",
        )
        db.add(analytics_rec)


@router.get("", response_model=List[SiteOut])
def list_sites(
    project_id: Optional[UUID] = Query(None, description="Filter sites by project ID"),
    site_type: Optional[SiteType] = Query(None, description="Filter sites by site type"),
    search: Optional[str] = Query(None, description="Search term for site name or description"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    List all geographical sites across all projects with optional filtering.
    """
    query = db.query(Site)

    if project_id:
        query = query.filter(Site.project_id == project_id)

    if site_type:
        query = query.filter(Site.site_type == site_type)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Site.name.ilike(search_pattern),
                Site.description.ilike(search_pattern),
            )
        )

    sites = query.order_by(Site.created_at.desc()).all()
    return [_format_site_out(s) for s in sites]


@router.get("/geojson/all", response_model=GeoJSONFeatureCollection)
def get_all_sites_geojson(
    project_id: Optional[UUID] = Query(None, description="Filter GeoJSON by project ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Export all sites (or filtered by project) as a standard GeoJSON FeatureCollection for Mapbox rendering.
    """
    query = db.query(Site)
    if project_id:
        query = query.filter(Site.project_id == project_id)

    sites = query.all()
    features = []

    for site in sites:
        geom_dict = geometry_to_geojson(site.geometry)
        if geom_dict:
            features.append(
                GeoJSONFeature(
                    type="Feature",
                    id=str(site.id),
                    geometry=geom_dict,
                    properties={
                        "id": str(site.id),
                        "name": site.name,
                        "description": site.description or "",
                        "site_type": site.site_type.value
                        if hasattr(site.site_type, "value")
                        else str(site.site_type),
                        "project_id": str(site.project_id),
                        "project_name": site.project.name if site.project else "",
                        "project_type": site.project.project_type.value
                        if site.project and hasattr(site.project.project_type, "value")
                        else "Carbon",
                        "area_hectares": site.area_hectares,
                        "area_km2": site.area_km2,
                        "centroid_lat": site.centroid_latitude,
                        "centroid_lon": site.centroid_longitude,
                        "created_at": site.created_at.isoformat() if site.created_at else "",
                    },
                )
            )

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


@router.post("", response_model=SiteOut, status_code=status.HTTP_201_CREATED)
def create_site(
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new geographical site within a project from GeoJSON polygon geometry.
    Performs PostGIS geometry validation, calculates accurate geodesic area, centroid, and bounding box.
    """
    project = db.query(Project).filter(Project.id == site_in.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent project with ID {site_in.project_id} not found.",
        )

    try:
        geom_shape, area_ha, area_km2, centroid_lat, centroid_lon, bbox = (
            validate_and_process_geojson(site_in.geometry)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid geometry: {str(e)}",
        )

    geoalchemy_geom = from_shape(geom_shape, srid=4326)

    site = Site(
        project_id=site_in.project_id,
        name=site_in.name.strip(),
        description=site_in.description.strip() if site_in.description else None,
        site_type=site_in.site_type,
        geometry=geoalchemy_geom,
        area_hectares=area_ha,
        area_km2=area_km2,
        centroid_latitude=centroid_lat,
        centroid_longitude=centroid_lon,
        bbox_min_lon=bbox[0],
        bbox_min_lat=bbox[1],
        bbox_max_lon=bbox[2],
        bbox_max_lat=bbox[3],
    )

    db.add(site)
    db.commit()
    db.refresh(site)

    _generate_initial_seed_analytics(site, db)
    db.commit()
    db.refresh(site)

    return _format_site_out(site)


@router.get("/{site_id}", response_model=SiteOut)
def get_site_by_id(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get detailed site information including full GeoJSON geometry and calculated properties.
    """
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )
    return _format_site_out(site)


@router.put("/{site_id}", response_model=SiteOut)
def update_site(
    site_id: UUID,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update site metadata and optionally update polygon geometry with recalculated spatial metrics.
    """
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    if site_in.name is not None:
        site.name = site_in.name.strip()
    if site_in.description is not None:
        site.description = site_in.description.strip()
    if site_in.site_type is not None:
        site.site_type = site_in.site_type

    if site_in.geometry is not None:
        try:
            geom_shape, area_ha, area_km2, centroid_lat, centroid_lon, bbox = (
                validate_and_process_geojson(site_in.geometry)
            )
            site.geometry = from_shape(geom_shape, srid=4326)
            site.area_hectares = area_ha
            site.area_km2 = area_km2
            site.centroid_latitude = centroid_lat
            site.centroid_longitude = centroid_lon
            site.bbox_min_lon = bbox[0]
            site.bbox_min_lat = bbox[1]
            site.bbox_max_lon = bbox[2]
            site.bbox_max_lat = bbox[3]
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid geometry update: {str(e)}",
            )

    db.commit()
    db.refresh(site)
    return _format_site_out(site)


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a site and its associated analytics.
    """
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    db.delete(site)
    db.commit()
    return None
