from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.analytics import SiteAnalytics
from app.models.site import Site
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsRecord,
    CurrentMetrics,
    SiteAnalyticsResponse,
)

router = APIRouter()


@router.get("/sites/{site_id}/analytics", response_model=SiteAnalyticsResponse)
def get_site_analytics(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve comprehensive environmental metrics and time-series performance data for a given site.
    """
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    records = (
        db.query(SiteAnalytics)
        .filter(SiteAnalytics.site_id == site_id)
        .order_by(SiteAnalytics.recorded_date.asc())
        .all()
    )

    time_series = []
    for r in records:
        time_series.append(
            AnalyticsRecord(
                date=r.recorded_date.strftime("%Y-%m"),
                carbon_sequestration_tonnes=round(r.carbon_sequestration_tonnes, 2),
                carbon_reduction_rate=round(r.carbon_reduction_rate, 2),
                biodiversity_index=round(r.biodiversity_index, 2),
                vegetation_coverage_pct=round(r.vegetation_coverage_pct, 2),
                environmental_score=round(r.environmental_score, 2),
                notes=r.notes,
            )
        )

    # Current metrics are taken from latest record, or computed baseline if none exists
    if records:
        latest = records[-1]
        current_metrics = CurrentMetrics(
            carbon_sequestration_tonnes=round(latest.carbon_sequestration_tonnes, 2),
            carbon_reduction_rate=round(latest.carbon_reduction_rate, 2),
            biodiversity_index=round(latest.biodiversity_index, 2),
            vegetation_coverage_pct=round(latest.vegetation_coverage_pct, 2),
            environmental_score=round(latest.environmental_score, 2),
            recorded_date=latest.recorded_date.strftime("%Y-%m"),
        )
    else:
        current_metrics = CurrentMetrics(
            carbon_sequestration_tonnes=round(site.area_hectares * 3.5, 2),
            carbon_reduction_rate=12.4,
            biodiversity_index=75.0,
            vegetation_coverage_pct=80.0,
            environmental_score=78.5,
            recorded_date=None,
        )

    project = site.project
    return SiteAnalyticsResponse(
        site_id=site.id,
        site_name=site.name,
        project_id=site.project_id,
        project_name=project.name if project else "Unknown Project",
        project_type=project.project_type.value
        if project and hasattr(project.project_type, "value")
        else "Carbon",
        site_type=site.site_type.value if hasattr(site.site_type, "value") else str(site.site_type),
        area_hectares=site.area_hectares,
        area_km2=site.area_km2,
        metrics=current_metrics,
        time_series=time_series,
        is_sample_data=True,
        disclaimer="Demo / Sample Analytics generated for demonstration purposes.",
    )
