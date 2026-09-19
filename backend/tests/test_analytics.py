from fastapi import status


def test_site_analytics_retrieval(client, auth_headers):
    # 1. Create project
    proj_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Western Ghats Afforestation",
            "project_type": "Carbon",
            "status": "Active",
        },
        headers=auth_headers,
    )
    proj_id = proj_res.json()["id"]

    # 2. Create site
    site_res = client.post(
        "/api/v1/sites",
        json={
            "project_id": proj_id,
            "name": "Silent Valley Plot A",
            "site_type": "Forest",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [[76.4, 11.1], [76.5, 11.1], [76.5, 11.0], [76.4, 11.0], [76.4, 11.1]]
                ],
            },
        },
        headers=auth_headers,
    )
    site_id = site_res.json()["id"]

    # 3. Retrieve analytics
    res = client.get(f"/api/v1/sites/{site_id}/analytics", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["site_id"] == site_id
    assert "metrics" in data
    assert "time_series" in data
    assert isinstance(data["time_series"], list)
    assert data["is_sample_data"] is True
    assert data["metrics"]["carbon_sequestration_tonnes"] >= 0.0
    assert data["metrics"]["biodiversity_index"] >= 0.0


def test_dashboard_summary(client, auth_headers):
    res = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "total_projects" in data
    assert "total_sites" in data
    assert "total_area_hectares" in data
    assert "sites_geojson" in data
