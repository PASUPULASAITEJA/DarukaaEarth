from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.project import ProjectStatus, ProjectType


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    project_type: ProjectType = ProjectType.CARBON
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    country: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    project_type: Optional[ProjectType] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    country: Optional[str] = None
    region: Optional[str] = None


class ProjectOut(ProjectBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    sites_count: int = 0
    total_area_hectares: float = 0.0
    total_area_km2: float = 0.0

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    total: int
    items: List[ProjectOut]
    page: int
    page_size: int
    total_pages: int
