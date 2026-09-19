import os
import sqlite3

import pytest
from fastapi.testclient import TestClient
from shapely import wkb as shapely_wkb
from shapely import wkt as shapely_wkt
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set testing environment variables
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-pytest-execution-32chars!"

# Patch GeoAlchemy2 SQLite admin events before importing models/database
import geoalchemy2.admin.dialects.sqlite as sqlite_admin  # noqa: E402

sqlite_admin.before_create = lambda *a, **kw: None
sqlite_admin.after_create = lambda *a, **kw: None
sqlite_admin.before_drop = lambda *a, **kw: None
sqlite_admin.after_drop = lambda *a, **kw: None

from app.core.database import Base, get_db  # noqa: E402
from app.core.security import create_access_token, get_password_hash  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402

# In-memory SQLite engine for fast automated unit tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


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


@event.listens_for(engine, "connect")
def setup_sqlite_spatial_functions(dbapi_connection, connection_record):
    """Register spatial stub functions for SQLite in-memory test runner."""
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


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session) -> User:
    user = User(
        email="tester@darukaa.earth",
        name="Test Engineer",
        hashed_password=get_password_hash("SecretPassword123!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    token = create_access_token(subject=test_user.id)
    return {"Authorization": f"Bearer {token}"}
