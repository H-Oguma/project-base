"""FastAPIアプリケーションのメインモジュール。

APIエンドポイントの定義およびアプリケーションの設定を行います。
"""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

import models
from database import engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    """アプリケーションのライフサイクルイベント。
    
    起動時にデータベーステーブルを作成します。
    """
    models.Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

# CORS configuration (as per security rules, explicitly define origins in production)
origins = [
    "http://localhost:5173", # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ItemCreate(BaseModel):
    """アイテム作成用のPydanticモデル。"""
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=255)


class ItemResponse(BaseModel):
    """アイテム返却用のPydanticモデル。"""
    id: int
    title: str
    description: str

    model_config = ConfigDict(from_attributes=True)


@app.get("/")
def read_root():
    """ルートエンドポイント。
    
    ウェルカムメッセージを返却します。
    """
    return {"message": "Welcome to FastAPI + React Setup!"}


@app.post("/items/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """新しいアイテムを作成します。"""
    db_item = models.Item(title=item.title, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.get("/items/", response_model=list[ItemResponse])
def read_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """アイテムの一覧を取得します。
    
    ページネーションのためにskipとlimitを指定できます。
    """
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items
