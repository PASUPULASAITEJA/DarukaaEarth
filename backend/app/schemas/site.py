from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.site import SiteType


class SiteBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    site_type: SiteType = SiteType.FOREST


class SiteCreate(SiteBase):
    project_id: UUID
    geometry: Dict[str, Any] = Field(
        ...,
        description="GeoJSON geometry or Feature dictionary representing the drawn polygon.",
    )


class SiteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    site_type: Optional[SiteType] = None
    geometry: Optional[Dict[str, Any]] = None


class SiteOut(SiteBase):
    id: UUID
    project_id: UUID
    project_name: Optional[str] = None
    project_type: Optional[str] = None
    area_hectares: float
    area_km2: float
    centroid_latitude: float
    centroid_longitude: float
    bbox_min_lon: Optional[float] = None
    bbox_min_lat: Optional[float] = None
    bbox_max_lon: Optional[float] = None
    bbox_max_lat: Optional[float] = None
    geometry: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
