import logging
from typing import Any
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.site import Site
from app.models.user import User
from app.schemas.biodiversity import GBIFSpeciesRecord, SiteBiodiversityResponse
from app.services.gbif_service import (
    GBIF_SPECIES_URL,
    fetch_site_gbif_biodiversity,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/sites/{site_id}/biodiversity", response_model=SiteBiodiversityResponse)
async def get_site_biodiversity_assessment(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve live GBIF biodiversity telemetry, species richness, IUCN Red List status matrix,
    and verified biological observation occurrences for a site polygon or coordinates.
    """
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    try:
        assessment = await fetch_site_gbif_biodiversity(site)
        return assessment
    except Exception as e:
        logger.error(f"Failed to fetch GBIF biodiversity data for site {site_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to retrieve live data from GBIF Biodiversity API.",
        )


@router.get("/species/search", response_model=list[GBIFSpeciesRecord])
async def search_gbif_species(
    q: str = Query(..., min_length=2, description="Scientific or vernacular species query"),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Live taxonomic search querying the GBIF Species Backbone API.
    """
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(
                f"{GBIF_SPECIES_URL}/search",
                params={
                    "q": q,
                    "limit": limit,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                },
            )
            if res.status_code != 200:
                return []

            data = res.json()
            results = data.get("results", [])
            records = []
            for item in results:
                key = item.get("key")
                records.append(
                    GBIFSpeciesRecord(
                        gbif_id=str(key) if key else None,
                        scientific_name=item.get("scientificName", "Unknown"),
                        canonical_name=item.get("canonicalName"),
                        common_name=item.get("vernacularName"),
                        kingdom=item.get("kingdom", "Unknown"),
                        class_name=item.get("class"),
                        order=item.get("order"),
                        family=item.get("family"),
                        genus=item.get("genus"),
                        iucn_category="NE",
                        iucn_category_label="Not Evaluated",
                        occurrence_count=item.get("numDescendants", 1),
                        gbif_url=f"https://www.gbif.org/species/{key}" if key else None,
                    )
                )
            return records
    except Exception as e:
        logger.error(f"Error querying GBIF species search: {e}")
        return []
