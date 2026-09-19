import sqlite3
from typing import Generator

import geoalchemy2.admin.dialects.sqlite as sqlite_admin
from shapely import wkb as shapely_wkb
from shapely import wkt as shapely_wkt
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

# Patch GeoAlchemy2 SQLite admin events for zero-configuration local SQLite execution
sqlite_admin.before_create = lambda *a, **kw: None
sqlite_admin.after_create = lambda *a, **kw: None
sqlite_admin.before_drop = lambda *a, **kw: None
sqlite_admin.after_drop = lambda *a, **kw: None

db_url = settings.DATABASE_URL


def _ewkt_to_hex_ewkb(val):
    if not val:
        return val
    try:
        if isinstance(val, str):
            if ";" in val:
                _, wkt_part = val.split(";", 1)
            else:
                wkt_part = val
            geom = shapely_wkt.loads(wkt_part)
            return shapely_wkb.dumps(geom, hex=True, srid=4326)
        return val
    except Exception:
        return val


def create_db_engine():
    global db_url
    connect_args = {}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False

    try:
        eng = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True,
        )
        if "postgresql" in db_url:
            with eng.connect() as conn:
                conn.execute(text("SELECT 1;"))
        return eng
    except Exception as e:
        print(
            f"[Database Notice] Could not connect to PostgreSQL ({e}). Falling back to local SQLite 'darukaa.db'."
        )
        db_url = "sqlite:///darukaa.db"
        eng = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )
        return eng


engine = create_db_engine()


@event.listens_for(engine, "connect")
def setup_sqlite_spatial_functions(dbapi_connection, connection_record):
    """Register spatial stub functions if SQLite is in use."""
    if isinstance(dbapi_connection, sqlite3.Connection):
        dbapi_connection.create_function("AsEWKB", 1, lambda x: x)
        dbapi_connection.create_function("GeomFromEWKB", 1, lambda x: x)
        dbapi_connection.create_function("GeomFromEWKT", 1, _ewkt_to_hex_ewkb)
        dbapi_connection.create_function("ST_GeomFromEWKT", 1, _ewkt_to_hex_ewkb)
        dbapi_connection.create_function("GeomFromText", 1, _ewkt_to_hex_ewkb)
        dbapi_connection.create_function("ST_GeomFromText", 1, _ewkt_to_hex_ewkb)
        dbapi_connection.create_function("ST_GeomFromGeoJSON", 1, _ewkt_to_hex_ewkb)
        dbapi_connection.create_function("ST_AsBinary", 1, lambda x: x)
        dbapi_connection.create_function("ST_AsGeoJSON", 1, lambda x: x)
        dbapi_connection.create_function("ST_AsEWKT", 1, lambda x: x)
        dbapi_connection.create_function("CheckSpatialIndex", 2, lambda a, b: 0)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a SQLAlchemy session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Ensure PostGIS extension exists if PostgreSQL, and create all tables."""
    if "postgresql" in db_url:
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)
