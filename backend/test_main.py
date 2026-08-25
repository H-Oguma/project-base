import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
from database import get_db
from main import app

# インメモリSQLite用の設定
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # テーブルの作成
    models.Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # テーブルの破棄
        models.Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to FastAPI + React Setup!"}

def test_create_item(client):
    response = client.post(
        "/items/",
        json={"title": "Test Item", "description": "This is a test"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Item"
    assert data["description"] == "This is a test"
    assert "id" in data

def test_read_items(client):
    # GET /items/ の正常系テスト
    client.post("/items/", json={"title": "Item 1", "description": "Desc 1"})
    client.post("/items/", json={"title": "Item 2", "description": "Desc 2"})
    
    response = client.get("/items/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Item 1"
    assert data[1]["title"] == "Item 2"

def test_create_item_validation_error(client):
    # 必須項目の不足による 422 異常系テスト
    response = client.post(
        "/items/",
        json={"description": "Missing title"}
    )
    assert response.status_code == 422
