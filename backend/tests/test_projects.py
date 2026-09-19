from fastapi import status


def test_create_project_success(client, auth_headers):
    payload = {
        "name": "Sundarbans Delta Project",
        "description": "Mangrove restoration in delta region",
        "project_type": "Carbon & Biodiversity",
        "status": "Active",
        "country": "India",
        "region": "West Bengal",
        "start_date": "2024-01-01",
    }
    response = client.post("/api/v1/projects", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Sundarbans Delta Project"
    assert data["project_type"] == "Carbon & Biodiversity"
    assert data["status"] == "Active"
    assert "id" in data


def test_list_projects_with_filters(client, auth_headers):
    # Create project 1
    client.post(
        "/api/v1/projects",
        json={
            "name": "Boreal Forest Conservation",
            "project_type": "Carbon",
            "status": "Planning",
            "country": "Canada",
        },
        headers=auth_headers,
    )
    # Create project 2
    client.post(
        "/api/v1/projects",
        json={
            "name": "Madagascar Coral & Mangrove",
            "project_type": "Biodiversity",
            "status": "Active",
            "country": "Madagascar",
        },
        headers=auth_headers,
    )

    # Search filter
    res = client.get("/api/v1/projects?search=Boreal", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()["items"]) >= 1
    assert "Boreal" in res.json()["items"][0]["name"]

    # Type filter
    res_type = client.get("/api/v1/projects?project_type=Biodiversity", headers=auth_headers)
    assert res_type.status_code == status.HTTP_200_OK
    for p in res_type.json()["items"]:
        assert p["project_type"] == "Biodiversity"


def test_get_and_update_project(client, auth_headers):
    create_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Peatland Restoration A",
            "project_type": "Carbon",
            "status": "Planning",
        },
        headers=auth_headers,
    )
    project_id = create_res.json()["id"]

    # Fetch
    get_res = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_res.status_code == status.HTTP_200_OK
    assert get_res.json()["name"] == "Peatland Restoration A"

    # Update
    update_res = client.put(
        f"/api/v1/projects/{project_id}",
        json={"status": "Active", "description": "Updated project description"},
        headers=auth_headers,
    )
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.json()["status"] == "Active"
    assert update_res.json()["description"] == "Updated project description"


def test_delete_project(client, auth_headers):
    create_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Temporary Project to Delete",
            "project_type": "Carbon",
            "status": "Planning",
        },
        headers=auth_headers,
    )
    project_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # Ensure 404 when fetching deleted
    get_res = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_res.status_code == status.HTTP_404_NOT_FOUND


def test_unauthorized_project_access(client):
    res = client.get("/api/v1/projects")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
