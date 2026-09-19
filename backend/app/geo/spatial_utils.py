import math
from typing import Any, Dict, Optional, Tuple

from geoalchemy2.elements import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from shapely import wkb as shapely_wkb
from shapely import wkt as shapely_wkt
from shapely.geometry import MultiPolygon, Polygon, mapping, shape


def calculate_geodesic_area(geom_shape) -> float:
    """
    Calculate the accurate geodesic area of a polygon/multipolygon in square meters on WGS84 ellipsoid.
    Uses spherical excess with Earth authalic radius R = 6,371,008.8 meters.
    """
    EARTH_RADIUS = 6371008.8  # meters

    def _ring_area(coords) -> float:
        if len(coords) < 3:
            return 0.0
        total = 0.0
        n = len(coords)
        for i in range(n):
            p1 = coords[i]
            p2 = coords[(i + 1) % n]
            lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
            lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
            total += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
        area = abs(total * (EARTH_RADIUS**2) / 2.0)
        return area

    def _poly_area(poly: Polygon) -> float:
        exterior_area = _ring_area(poly.exterior.coords)
        interiors_area = sum(_ring_area(interior.coords) for interior in poly.interiors)
        return max(0.0, exterior_area - interiors_area)

    if isinstance(geom_shape, Polygon):
        return _poly_area(geom_shape)
    elif isinstance(geom_shape, MultiPolygon):
        return sum(_poly_area(poly) for poly in geom_shape.geoms)
    else:
        centroid = geom_shape.centroid
        lat_rad = math.radians(centroid.y)
        deg_to_m_lat = 111132.954 - 559.822 * math.cos(2 * lat_rad) + 1.175 * math.cos(4 * lat_rad)
        deg_to_m_lon = 111412.84 * math.cos(lat_rad) - 93.5 * math.cos(3 * lat_rad)
        return geom_shape.area * deg_to_m_lat * deg_to_m_lon


def validate_and_process_geojson(
    geojson_dict: Dict[str, Any],
) -> Tuple[Any, float, float, float, float, Tuple[float, float, float, float]]:
    """
    Validates GeoJSON geometry dict or Feature dict, parses into Shapely geometry,
    and returns (shapely_geom, area_hectares, area_km2, centroid_lat, centroid_lon, bbox).
    """
    if not geojson_dict:
        raise ValueError("GeoJSON geometry payload cannot be empty.")

    if geojson_dict.get("type") == "Feature":
        geom_dict = geojson_dict.get("geometry")
        if not geom_dict:
            raise ValueError("GeoJSON Feature missing 'geometry' field.")
    else:
        geom_dict = geojson_dict

    try:
        geom_shape = shape(geom_dict)
    except Exception as e:
        raise ValueError(f"Invalid GeoJSON geometry structure: {str(e)}")

    if not geom_shape.is_valid:
        from shapely.validation import make_valid

        geom_shape = make_valid(geom_shape)
        if not geom_shape.is_valid:
            raise ValueError("The provided polygon geometry is topologically invalid.")

    if not isinstance(geom_shape, (Polygon, MultiPolygon)):
        raise ValueError(
            f"Site geometry must be a Polygon or MultiPolygon. Received: {geom_shape.geom_type}"
        )

    if geom_shape.is_empty:
        raise ValueError("Provided polygon geometry is empty.")

    # Calculate accurate geodesic area
    area_m2 = calculate_geodesic_area(geom_shape)
    area_hectares = round(area_m2 / 10000.0, 4)
    area_km2 = round(area_m2 / 1000000.0, 4)

    # Centroid
    centroid = geom_shape.centroid
    centroid_lat = round(float(centroid.y), 6)
    centroid_lon = round(float(centroid.x), 6)

    # Bounding box [min_lon, min_lat, max_lon, max_lat]
    min_lon, min_lat, max_lon, max_lat = geom_shape.bounds
    bbox = (
        round(float(min_lon), 6),
        round(float(min_lat), 6),
        round(float(max_lon), 6),
        round(float(max_lat), 6),
    )

    return geom_shape, area_hectares, area_km2, centroid_lat, centroid_lon, bbox


def geometry_to_geojson(geom_element) -> Optional[Dict[str, Any]]:
    """Convert GeoAlchemy2 element, binary WKB, WKT, or Shapely object to standard GeoJSON dict."""
    if geom_element is None:
        return None
    try:
        if isinstance(geom_element, WKBElement):
            shapely_geom = to_shape(geom_element)
            return mapping(shapely_geom)
        elif isinstance(geom_element, WKTElement):
            shapely_geom = shapely_wkt.loads(str(geom_element))
            return mapping(shapely_geom)
        elif isinstance(geom_element, (bytes, bytearray, memoryview)):
            shapely_geom = shapely_wkb.loads(bytes(geom_element))
            return mapping(shapely_geom)
        elif isinstance(geom_element, str):
            if geom_element.startswith("{"):
                import json

                return json.loads(geom_element)
            shapely_geom = shapely_wkt.loads(geom_element)
            return mapping(shapely_geom)
        elif hasattr(geom_element, "__geo_interface__"):
            return mapping(geom_element)
        return None
    except Exception:
        return None
