from fastapi import status


def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane.doe@darukaa.earth",
            "password": "StrongPassword123!",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane.doe@darukaa.earth"
    assert data["user"]["name"] == "Jane Doe"


def test_register_duplicate_email_fails(client, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate User",
            "email": test_user.email,
            "password": "Password123!",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"].lower()


def test_register_short_password_fails(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Short Pass User",
            "email": "short@darukaa.earth",
            "password": "123",
        },
    )
    assert response.status_code in [
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
    ]


def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "SecretPassword123!",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user.email


def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "WrongPassword999!",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_me_authenticated(client, auth_headers, test_user):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == test_user.email
    assert data["name"] == test_user.name


def test_get_current_user_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
