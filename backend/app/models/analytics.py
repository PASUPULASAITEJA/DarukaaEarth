import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    site_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_date = Column(Date, nullable=False, default=date.today, index=True)

    # Core Environmental Metrics
    carbon_sequestration_tonnes = Column(Float, nullable=False, default=0.0)
    carbon_reduction_rate = Column(Float, nullable=False, default=0.0)  # percentage or rate
    biodiversity_index = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0 score
    vegetation_coverage_pct = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0%
    environmental_score = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0 composite index

    # Flag indicating whether this is demo/sample synthetic data or ground-truth
    is_sample_data = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    site = relationship("Site", back_populates="analytics")
