from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import models
from config import settings
from database import engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # DBテーブルの作成
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

# CORS設定（環境変数から読み込む）
# (as per security rules, explicitly define origins in production)
origins = (
    settings.cors_origins.split(",")
    if settings.cors_origins
    else ["http://localhost:5173"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ItemCreate(BaseModel):
    title: str
    description: str


class ItemResponse(BaseModel):
    id: int
    title: str
    description: str

    model_config = ConfigDict(from_attributes=True)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to FastAPI + React Setup!"}


@app.post("/items/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)) -> models.Item:
    db_item = models.Item(title=item.title, description=item.description)
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred") from e
    return db_item


@app.get("/items/", response_model=list[ItemResponse])
def read_items(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[models.Item]:
    try:
        items = db.query(models.Item).offset(skip).limit(limit).all()
        return items
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred") from e
