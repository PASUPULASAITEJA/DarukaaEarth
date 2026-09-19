import uuid
from datetime import datetime, timezone
from enum import Enum

from geoalchemy2 import Geometry
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SqlEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import relationship

from app.core.database import Base


# Ensure SQLite in-memory test dialect compiles Geometry as BLOB
@compiles(Geometry, "sqlite")
def compile_geometry_sqlite(type_, compiler, **kw):
    return "BLOB"


class SiteType(str, Enum):
    FOREST = "Forest"
    PEATLAND = "Peatland"
    WETLAND = "Wetland"
    GRASSLAND = "Grassland"
    MANGROVE = "Mangrove"
    AGROFORESTRY = "Agroforestry"
    MARINE = "Marine"
    SAVANNA = "Savanna"
    OTHER = "Other"


class Site(Base):
    __tablename__ = "sites"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    site_type = Column(
        SqlEnum(
            SiteType,
            name="site_type_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=SiteType.FOREST,
        index=True,
    )

    # PostGIS Spatial Geometry (SRID 4326 = WGS 84 GPS Lat/Lon) with spatial indexing
    geometry = Column(
        Geometry(
            geometry_type="GEOMETRY",
            srid=4326,
            spatial_index=False,
        ),
        nullable=False,
    )

    # Pre-calculated geospatial metrics
    area_hectares = Column(Float, nullable=False, default=0.0)
    area_km2 = Column(Float, nullable=False, default=0.0)
    centroid_latitude = Column(Float, nullable=False)
    centroid_longitude = Column(Float, nullable=False)
    bbox_min_lon = Column(Float, nullable=True)
    bbox_min_lat = Column(Float, nullable=True)
    bbox_max_lon = Column(Float, nullable=True)
    bbox_max_lat = Column(Float, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="sites")
    analytics = relationship(
        "SiteAnalytics",
        back_populates="site",
        cascade="all, delete-orphan",
        order_by="SiteAnalytics.recorded_date",
    )
