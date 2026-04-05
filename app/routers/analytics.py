from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.analytics_service import analytics_service
from app.models.user import User
from app.dependencies import get_current_user
from typing import Dict, Any, List

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=Dict[str, Any])
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_dashboard_summary(db, current_user.id)

@router.get("/monthly-report", response_model=List[Dict[str, Any]])
def get_monthly_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_monthly_report(db, current_user.id)
