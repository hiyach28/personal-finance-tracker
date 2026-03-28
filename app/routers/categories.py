from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.schemas.category import CategoryResponse
from app.services.category_service import category_service
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

@router.on_event("startup")
def startup_event():
    # Attempt to seed categories on startup
    db = next(get_db())
    category_service.seed_categories(db)
    db.close()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return category_service.get_categories(db)
