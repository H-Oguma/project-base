from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to FastAPI + React Setup!"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"title": "Test Item", "description": "This is a test"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Item"
    assert data["description"] == "This is a test"
    assert "id" in data
