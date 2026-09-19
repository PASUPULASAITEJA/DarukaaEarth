from fastapi import APIRouter

from app.api.v1 import analytics, auth, biodiversity, dashboard, projects, sites

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(sites.router, prefix="/sites", tags=["Sites & Geospatial"])
api_router.include_router(analytics.router, tags=["Analytics"])
api_router.include_router(biodiversity.router, prefix="/biodiversity", tags=["Biodiversity & GBIF"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
