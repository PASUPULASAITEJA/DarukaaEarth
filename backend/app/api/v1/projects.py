from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.geo.spatial_utils import geometry_to_geojson
from app.models.project import Project, ProjectStatus, ProjectType
from app.models.site import Site
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectOut,
    ProjectUpdate,
)
from app.schemas.site import SiteOut

router = APIRouter()


def _enrich_project_out(project: Project) -> ProjectOut:
    """Enrich project with aggregate site statistics."""
    sites_count = len(project.sites) if project.sites else 0
    total_area_ha = sum(s.area_hectares for s in project.sites) if project.sites else 0.0
    total_area_km2 = sum(s.area_km2 for s in project.sites) if project.sites else 0.0

    return ProjectOut(
        id=project.id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        status=project.status,
        start_date=project.start_date,
        end_date=project.end_date,
        country=project.country,
        region=project.region,
        created_by=project.created_by,
        created_at=project.created_at,
        updated_at=project.updated_at,
        sites_count=sites_count,
        total_area_hectares=round(total_area_ha, 4),
        total_area_km2=round(total_area_km2, 4),
    )


@router.get("", response_model=ProjectListResponse)
def list_projects(
    search: Optional[str] = Query(
        None, description="Search term for name, description, country or region"
    ),
    project_type: Optional[ProjectType] = Query(None, description="Filter by project type"),
    status_filter: Optional[ProjectStatus] = Query(
        None, alias="status", description="Filter by status"
    ),
    country: Optional[str] = Query(None, description="Filter by country"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    List all environmental projects with multi-criteria filtering, search, and pagination.
    """
    query = db.query(Project)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Project.name.ilike(search_pattern),
                Project.description.ilike(search_pattern),
                Project.country.ilike(search_pattern),
                Project.region.ilike(search_pattern),
            )
        )

    if project_type:
        query = query.filter(Project.project_type == project_type)

    if status_filter:
        query = query.filter(Project.status == status_filter)

    if country:
        query = query.filter(Project.country.ilike(f"%{country.strip()}%"))

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    projects = query.order_by(Project.created_at.desc()).offset(offset).limit(page_size).all()

    items = [_enrich_project_out(p) for p in projects]

    return {
        "total": total,
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new environmental project.
    """
    project = Project(
        name=project_in.name.strip(),
        description=project_in.description.strip() if project_in.description else None,
        project_type=project_in.project_type,
        status=project_in.status,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        country=project_in.country.strip() if project_in.country else None,
        region=project_in.region.strip() if project_in.region else None,
        created_by=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _enrich_project_out(project)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project_by_id(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve single project details with aggregate statistics.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )
    return _enrich_project_out(project)


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update project metadata.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return _enrich_project_out(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a project and all associated sites & analytics.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )

    db.delete(project)
    db.commit()
    return None


@router.get("/{project_id}/sites", response_model=List[SiteOut])
def get_project_sites(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all geographical sites belonging to a specific project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )

    sites = db.query(Site).filter(Site.project_id == project_id).all()
    out_list = []
    for s in sites:
        out_list.append(
            SiteOut(
                id=s.id,
                project_id=s.project_id,
                project_name=project.name,
                project_type=project.project_type.value
                if hasattr(project.project_type, "value")
                else str(project.project_type),
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
        )

    return out_list
