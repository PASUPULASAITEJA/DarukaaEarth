from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AnalyticsRecord(BaseModel):
    date: str  # YYYY-MM or YYYY-MM-DD
    carbon_sequestration_tonnes: float = Field(
        ..., description="Cumulative or monthly tonnes of CO2 equivalent sequestered"
    )
    carbon_reduction_rate: float = Field(..., description="Carbon emission reduction rate %")
    biodiversity_index: float = Field(..., description="Biodiversity health index (0 - 100)")
    vegetation_coverage_pct: float = Field(
        ..., description="NDVI-derived vegetation coverage percentage (0 - 100)"
    )
    environmental_score: float = Field(
        ..., description="Composite environmental performance score (0 - 100)"
    )
    notes: Optional[str] = None


class CurrentMetrics(BaseModel):
    carbon_sequestration_tonnes: float
    carbon_reduction_rate: float
    biodiversity_index: float
    vegetation_coverage_pct: float
    environmental_score: float
    recorded_date: Optional[str] = None


class SiteAnalyticsResponse(BaseModel):
    site_id: UUID
    site_name: str
    project_id: UUID
    project_name: str
    project_type: str
    site_type: str
    area_hectares: float
    area_km2: float
    metrics: CurrentMetrics
    time_series: List[AnalyticsRecord]
    is_sample_data: bool = True
    disclaimer: str = "Demo / Sample Analytics generated for demonstration purposes."
