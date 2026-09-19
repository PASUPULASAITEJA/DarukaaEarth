from datetime import date

from geoalchemy2.shape import from_shape

from app.core.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.geo.spatial_utils import validate_and_process_geojson
from app.models.analytics import SiteAnalytics
from app.models.project import Project, ProjectStatus, ProjectType
from app.models.site import Site, SiteType
from app.models.user import User


def seed_database():
    """Seed the database with sample administrator, projects, sites, and historical time-series analytics."""
    print("[SEED] Starting Darukaa.Earth database seed...")
    init_db()
    db = SessionLocal()

    try:
        # Check if seed user already exists
        admin_email = "admin@darukaa.earth"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                name="Darukaa Administrator",
                hashed_password=get_password_hash("AdminPass123!"),
                is_active=True,
                is_superuser=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"[SUCCESS] Created admin user: {admin_email} (Password: AdminPass123!)")
        else:
            print(f"[INFO] Admin user already exists: {admin_email}")

        # Check if projects exist
        existing_projects = db.query(Project).count()
        if existing_projects > 0:
            print("[INFO] Database already contains projects. Skipping seed generation.")
            return

        sample_projects_data = [
            {
                "name": "Amazonian Primary Rainforest Corridor",
                "description": "Large-scale tropical rainforest conservation, indigenous territory protection, and high-integrity carbon sequestration monitoring in the Western Amazon basin.",
                "project_type": ProjectType.CARBON_AND_BIODIVERSITY,
                "status": ProjectStatus.ACTIVE,
                "country": "Brazil",
                "region": "Amazonas / Acre",
                "start_date": date(2023, 1, 15),
                "sites": [
                    {
                        "name": "Juruá River Basin Core Reserve",
                        "description": "Pristine canopy habitat with high biomass density, multi-layer carbon storage, and jaguar corridor.",
                        "site_type": SiteType.FOREST,
                        "geojson": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [-70.520, -7.510],
                                    [-70.430, -7.510],
                                    [-70.410, -7.580],
                                    [-70.500, -7.590],
                                    [-70.520, -7.510],
                                ]
                            ],
                        },
                        "base_carbon": 142.5,
                        "base_bio": 92.4,
                        "base_veg": 95.8,
                    },
                    {
                        "name": "Purus Riparian Buffer Sector A",
                        "description": "Restoration zone along the Purus tributaries with active community patrols and satellite monitoring.",
                        "site_type": SiteType.FOREST,
                        "geojson": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [-68.250, -6.120],
                                    [-68.160, -6.110],
                                    [-68.140, -6.180],
                                    [-68.230, -6.190],
                                    [-68.250, -6.120],
                                ]
                            ],
                        },
                        "base_carbon": 98.2,
                        "base_bio": 86.1,
                        "base_veg": 89.3,
                    },
                ],
            },
            {
                "name": "Western Ghats Ecological Reforestation",
                "description": "Biodiversity hotspot afforestation initiative targeting endemic flora restoration and soil carbon capture across the montane cloud forests.",
                "project_type": ProjectType.CARBON,
                "status": ProjectStatus.ACTIVE,
                "country": "India",
                "region": "Tamil Nadu / Kerala",
                "start_date": date(2023, 6, 1),
                "sites": [
                    {
                        "name": "Anamalai Shola Grassland & Forest",
                        "description": "High-altitude shola-grassland complex focusing on native oak, rhododendron, and Nilgiri Tahr habitat preservation.",
                        "site_type": SiteType.AGROFORESTRY,
                        "geojson": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [76.920, 10.420],
                                    [77.010, 10.420],
                                    [77.000, 10.330],
                                    [76.910, 10.340],
                                    [76.920, 10.420],
                                ]
                            ],
                        },
                        "base_carbon": 74.8,
                        "base_bio": 88.5,
                        "base_veg": 84.2,
                    },
                    {
                        "name": "Silent Valley Buffer Zone B",
                        "description": "Continuous evergreen tropical forest canopy with high soil organic carbon accumulation.",
                        "site_type": SiteType.FOREST,
                        "geojson": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [76.420, 11.120],
                                    [76.510, 11.130],
                                    [76.490, 11.040],
                                    [76.400, 11.050],
                                    [76.420, 11.120],
                                ]
                            ],
                        },
                        "base_carbon": 85.0,
                        "base_bio": 91.0,
                        "base_veg": 93.5,
                    },
                ],
            },
            {
                "name": "Flow Country Peatland Restoration",
                "description": "Blanket bog rewetting and peatland carbon reservoir preservation project across the northern Scottish Highlands.",
                "project_type": ProjectType.BIODIVERSITY,
                "status": ProjectStatus.ACTIVE,
                "country": "United Kingdom",
                "region": "Highlands, Scotland",
                "start_date": date(2024, 2, 10),
                "sites": [
                    {
                        "name": "Forsinard Peat Bog Sanctuary",
                        "description": "Deep sphagnum peat bog acting as a long-term carbon sink and breeding ground for rare wading birds.",
                        "site_type": SiteType.PEATLAND,
                        "geojson": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [-3.850, 58.350],
                                    [-3.720, 58.360],
                                    [-3.710, 58.260],
                                    [-3.840, 58.250],
                                    [-3.850, 58.350],
                                ]
                            ],
                        },
                        "base_carbon": 115.0,
                        "base_bio": 81.3,
                        "base_veg": 76.5,
                    }
                ],
            },
            {
                "name": "Sundarbans Mangrove Blue Carbon Venture",
                "description": "Tidal mangrove restoration protecting coastal communities from storm surges while capturing high rates of blue carbon in wetland sediment.",
                "project_type": ProjectType.CARBON_AND_BIODIVERSITY,
                "status": ProjectStatus.PLANNING,
                "country": "India",
                "region": "West Bengal",
                "start_date": date(2024, 8, 1),
                "sites": [
                    {
                        "name": "Gosaba Tidal Mangrove Delta",
                        "description": "Rhizophora and Avicennia mangrove restoration zone in tidal flats.",
                        "site_type": SiteType.MANGROVE,
                        "geojson": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [88.750, 22.180],
                                    [88.850, 22.170],
                                    [88.830, 22.100],
                                    [88.730, 22.110],
                                    [88.750, 22.180],
                                ]
                            ],
                        },
                        "base_carbon": 130.2,
                        "base_bio": 87.6,
                        "base_veg": 88.0,
                    }
                ],
            },
        ]

        today = date.today()

        for p_data in sample_projects_data:
            project = Project(
                name=p_data["name"],
                description=p_data["description"],
                project_type=p_data["project_type"],
                status=p_data["status"],
                start_date=p_data["start_date"],
                country=p_data["country"],
                region=p_data["region"],
                created_by=admin.id,
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"  [PROJECT] Created: {project.name}")

            for s_data in p_data["sites"]:
                geom_shape, area_ha, area_km2, centroid_lat, centroid_lon, bbox = (
                    validate_and_process_geojson(s_data["geojson"])
                )
                geoalchemy_geom = from_shape(geom_shape, srid=4326)

                site = Site(
                    project_id=project.id,
                    name=s_data["name"],
                    description=s_data["description"],
                    site_type=s_data["site_type"],
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
                print(f"    [SITE] Created: {site.name} ({site.area_hectares} ha)")

                # Generate 12 months of historical time-series analytics
                for m in range(11, -1, -1):
                    month_num = (today.month - m - 1) % 12 + 1
                    year_offset = (today.month - m - 1) // 12
                    rec_date = date(today.year + year_offset, month_num, 15)

                    progress = (12 - m) / 12.0
                    c_val = round(s_data["base_carbon"] * (0.75 + 0.28 * progress), 2)
                    c_rate = round(6.5 + 4.5 * progress, 1)
                    bio_val = min(99.0, round(s_data["base_bio"] * (0.88 + 0.14 * progress), 1))
                    veg_val = min(99.0, round(s_data["base_veg"] * (0.85 + 0.16 * progress), 1))
                    env_score = round(bio_val * 0.45 + veg_val * 0.35 + min(20.0, c_val / 8.0), 1)

                    analytics = SiteAnalytics(
                        site_id=site.id,
                        recorded_date=rec_date,
                        carbon_sequestration_tonnes=c_val,
                        carbon_reduction_rate=c_rate,
                        biodiversity_index=bio_val,
                        vegetation_coverage_pct=veg_val,
                        environmental_score=env_score,
                        is_sample_data=True,
                        notes=f"Synthetic demonstration metrics for {rec_date.strftime('%B %Y')}",
                    )
                    db.add(analytics)

                db.commit()

        print("[SUCCESS] Database seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
