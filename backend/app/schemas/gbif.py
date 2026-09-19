from typing import List, Optional

from pydantic import BaseModel


class GbifSpeciesItem(BaseModel):
    key: int
    scientific_name: str
    vernacular_name: Optional[str] = None
    kingdom: Optional[str] = "Unknown"
    phylum: Optional[str] = None
    order: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    species: Optional[str] = None
    decimal_latitude: Optional[float] = None
    decimal_longitude: Optional[float] = None
    event_date: Optional[str] = None
    recorded_by: Optional[str] = None
    iucn_red_list_category: Optional[str] = None  # e.g. "CR", "EN", "VU", "NT", "LC"
    image_url: Optional[str] = None
    gbif_url: str


class GbifSpeciesSummary(BaseModel):
    total_occurrences: int
    returned_count: int
    endangered_count: int
    kingdom_distribution: dict[str, int]
    species_list: List[GbifSpeciesItem]
    query_polygon_wkt: Optional[str] = None
    datasource: str = "GBIF (Global Biodiversity Information Facility) REST API"
