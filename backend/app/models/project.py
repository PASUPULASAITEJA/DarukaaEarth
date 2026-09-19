import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SqlEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProjectType(str, Enum):
    CARBON = "Carbon"
    BIODIVERSITY = "Biodiversity"
    CARBON_AND_BIODIVERSITY = "Carbon & Biodiversity"


class ProjectStatus(str, Enum):
    PLANNING = "Planning"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    ARCHIVED = "Archived"


class Project(Base):
    __tablename__ = "projects"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(
        SqlEnum(
            ProjectType,
            name="project_type_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=ProjectType.CARBON,
        index=True,
    )
    status = Column(
        SqlEnum(
            ProjectStatus,
            name="project_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=ProjectStatus.PLANNING,
        index=True,
    )
    start_date = Column(Date, nullable=True, default=date.today)
    end_date = Column(Date, nullable=True)
    country = Column(String(100), nullable=True, index=True)
    region = Column(String(100), nullable=True)

    created_by = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
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
    creator = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")
