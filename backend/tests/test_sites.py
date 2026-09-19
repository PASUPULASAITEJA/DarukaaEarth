import pytest
from fastapi import status


@pytest.fixture
def test_project_id(client, auth_headers):
    res = client.post(
        "/api/v1/projects",
        json={
            "name": "Amazon Basin Carbon Zone",
            "project_type": "Carbon & Biodiversity",
            "status": "Active",
            "country": "Brazil",
        },
        headers=auth_headers,
    )
    return res.json()["id"]


def test_create_site_valid_polygon(client, auth_headers, test_project_id):
    payload = {
        "project_id": test_project_id,
        "name": "Juruá Canopy Sector 1",
        "description": "High-density primary canopy polygon",
        "site_type": "Forest",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-70.52, -7.51],
                    [-70.43, -7.51],
                    [-70.41, -7.58],
                    [-70.50, -7.59],
                    [-70.52, -7.51],
                ]
            ],
        },
    }
    response = client.post("/api/v1/sites", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Juruá Canopy Sector 1"
    assert data["site_type"] == "Forest"
    assert data["area_hectares"] > 0.0
    assert data["area_km2"] > 0.0
    assert data["centroid_latitude"] < 0  # Southern hemisphere
    assert data["centroid_longitude"] < 0  # Western hemisphere
    assert "geometry" in data
    assert data["geometry"]["type"] == "Polygon"


def test_create_site_invalid_geometry(client, auth_headers, test_project_id):
    # Invalid: Point instead of polygon
    payload = {
        "project_id": test_project_id,
        "name": "Invalid Site",
        "site_type": "Forest",
        "geometry": {
            "type": "Point",
            "coordinates": [-70.52, -7.51],
        },
    }
    response = client.post("/api/v1/sites", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_site_nonexistent_project(client, auth_headers):
    payload = {
        "project_id": "00000000-0000-0000-0000-000000000000",
        "name": "Orphan Site",
        "site_type": "Forest",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]]],
        },
    }
    response = client.post("/api/v1/sites", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_sites_geojson_collection(client, auth_headers, test_project_id):
    # Add a site first
    client.post(
        "/api/v1/sites",
        json={
            "project_id": test_project_id,
            "name": "GeoJSON Test Site",
            "site_type": "Peatland",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [[-3.8, 58.3], [-3.7, 58.3], [-3.7, 58.2], [-3.8, 58.2], [-3.8, 58.3]]
                ],
            },
        },
        headers=auth_headers,
    )

    response = client.get("/api/v1/sites/geojson/all", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 1
    first_feat = data["features"][0]
    assert first_feat["type"] == "Feature"
    assert "properties" in first_feat
    assert "name" in first_feat["properties"]
