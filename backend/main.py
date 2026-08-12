from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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
    title: str
    description: str

class ItemResponse(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI + React Setup!"}

@app.post("/items/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(title=item.title, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/items/", response_model=list[ItemResponse])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items
