from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class TaxonCount(BaseModel):
    name: str
    count: int
    percentage: Optional[float] = None


class IUCNStatusSummary(BaseModel):
    critically_endangered: int = 0
    endangered: int = 0
    vulnerable: int = 0
    near_threatened: int = 0
    least_concern: int = 0
    data_deficient_or_not_evaluated: int = 0
    total_threatened: int = 0


class GBIFSpeciesRecord(BaseModel):
    gbif_id: Optional[str] = None
    scientific_name: str
    canonical_name: Optional[str] = None
    common_name: Optional[str] = None
    kingdom: Optional[str] = "Unknown"
    class_name: Optional[str] = Field(default=None, alias="class")
    order: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    iucn_category: Optional[str] = "NE"  # CR, EN, VU, NT, LC, DD, NE
    iucn_category_label: Optional[str] = "Not Evaluated"
    occurrence_count: int = 1
    recorded_date: Optional[str] = None
    image_url: Optional[str] = None
    license: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gbif_url: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class SiteBiodiversityResponse(BaseModel):
    site_id: UUID
    site_name: str
    area_hectares: float
    centroid_latitude: float
    centroid_longitude: float
    data_source: str = "GBIF (Global Biodiversity Information Facility)"
    source_url: str = "https://www.gbif.org"
    total_occurrences: int = 0
    distinct_species_count: int = 0
    biodiversity_index: float = 0.0  # 0 to 100 calculated composite health score
    shannon_diversity_index: float = 0.0
    threat_status_summary: IUCNStatusSummary
    kingdom_distribution: List[TaxonCount] = []
    class_distribution: List[TaxonCount] = []
    verified_species: List[GBIFSpeciesRecord] = []
    is_live_data: bool = True
    query_extent: str = "WGS84 Polygon Boundary"
    timestamp: str
