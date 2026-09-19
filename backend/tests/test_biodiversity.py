from fastapi import status


def test_site_gbif_biodiversity_assessment(client, auth_headers):
    # 1. Create a project
    proj_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Periyar Tiger Reserve Corridor",
            "project_type": "Biodiversity",
            "status": "Active",
        },
        headers=auth_headers,
    )
    assert proj_res.status_code == status.HTTP_201_CREATED
    proj_id = proj_res.json()["id"]

    # 2. Create a site with realistic polygon
    site_res = client.post(
        "/api/v1/sites",
        json={
            "project_id": proj_id,
            "name": "Periyar Core Habitat Zone",
            "site_type": "Forest",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [77.10, 9.45],
                        [77.20, 9.45],
                        [77.20, 9.35],
                        [77.10, 9.35],
                        [77.10, 9.45],
                    ]
                ],
            },
        },
        headers=auth_headers,
    )
    assert site_res.status_code == status.HTTP_201_CREATED
    site_id = site_res.json()["id"]

    # 3. Query GBIF biodiversity assessment endpoint
    res = client.get(f"/api/v1/biodiversity/sites/{site_id}/biodiversity", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()

    assert data["site_id"] == site_id
    assert "data_source" in data
    assert "GBIF" in data["data_source"]
    assert data["total_occurrences"] >= 0
    assert data["distinct_species_count"] >= 0
    assert 0.0 <= data["biodiversity_index"] <= 100.0
    assert "threat_status_summary" in data
    assert "kingdom_distribution" in data
    assert "verified_species" in data
    assert isinstance(data["verified_species"], list)
    assert len(data["verified_species"]) > 0


def test_gbif_species_search(client, auth_headers):
    res = client.get("/api/v1/biodiversity/species/search?q=Panthera", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert isinstance(data, list)
