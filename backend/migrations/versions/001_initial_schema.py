"""initial_schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""

from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 1. Users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2. Projects table
    project_type_enum = sa.Enum(
        "Carbon", "Biodiversity", "Carbon & Biodiversity", name="project_type_enum"
    )
    project_status_enum = sa.Enum(
        "Planning", "Active", "Completed", "Archived", name="project_status_enum"
    )

    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("project_type", project_type_enum, nullable=False),
        sa.Column("status", project_status_enum, nullable=False),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("region", sa.String(length=100), nullable=True),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_projects_id", "projects", ["id"], unique=False)
    op.create_index("ix_projects_name", "projects", ["name"], unique=False)
    op.create_index("ix_projects_project_type", "projects", ["project_type"], unique=False)
    op.create_index("ix_projects_status", "projects", ["status"], unique=False)
    op.create_index("ix_projects_country", "projects", ["country"], unique=False)

    # 3. Sites table with PostGIS Geometry
    site_type_enum = sa.Enum(
        "Forest",
        "Peatland",
        "Wetland",
        "Grassland",
        "Mangrove",
        "Agroforestry",
        "Marine",
        "Savanna",
        "Other",
        name="site_type_enum",
    )

    op.create_table(
        "sites",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("site_type", site_type_enum, nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.Geometry(geometry_type="GEOMETRY", srid=4326, spatial_index=True),
            nullable=False,
        ),
        sa.Column("area_hectares", sa.Float(), nullable=False, default=0.0),
        sa.Column("area_km2", sa.Float(), nullable=False, default=0.0),
        sa.Column("centroid_latitude", sa.Float(), nullable=False),
        sa.Column("centroid_longitude", sa.Float(), nullable=False),
        sa.Column("bbox_min_lon", sa.Float(), nullable=True),
        sa.Column("bbox_min_lat", sa.Float(), nullable=True),
        sa.Column("bbox_max_lon", sa.Float(), nullable=True),
        sa.Column("bbox_max_lat", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_sites_id", "sites", ["id"], unique=False)
    op.create_index("ix_sites_project_id", "sites", ["project_id"], unique=False)
    op.create_index("ix_sites_name", "sites", ["name"], unique=False)
    op.create_index("ix_sites_site_type", "sites", ["site_type"], unique=False)

    # 4. Site Analytics table
    op.create_table(
        "site_analytics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "site_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("sites.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("recorded_date", sa.Date(), nullable=False),
        sa.Column("carbon_sequestration_tonnes", sa.Float(), nullable=False, default=0.0),
        sa.Column("carbon_reduction_rate", sa.Float(), nullable=False, default=0.0),
        sa.Column("biodiversity_index", sa.Float(), nullable=False, default=0.0),
        sa.Column("vegetation_coverage_pct", sa.Float(), nullable=False, default=0.0),
        sa.Column("environmental_score", sa.Float(), nullable=False, default=0.0),
        sa.Column("is_sample_data", sa.Boolean(), nullable=False, default=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_site_analytics_id", "site_analytics", ["id"], unique=False)
    op.create_index("ix_site_analytics_site_id", "site_analytics", ["site_id"], unique=False)
    op.create_index(
        "ix_site_analytics_recorded_date", "site_analytics", ["recorded_date"], unique=False
    )


def downgrade() -> None:
    op.drop_table("site_analytics")
    op.drop_table("sites")
    op.drop_table("projects")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS site_type_enum;")
    op.execute("DROP TYPE IF EXISTS project_status_enum;")
    op.execute("DROP TYPE IF EXISTS project_type_enum;")
