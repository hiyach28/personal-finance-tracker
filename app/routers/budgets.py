from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.database.database import get_db
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services.budget_service import budget_service
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.post("/", response_model=BudgetResponse)
def set_budget(budget_in: BudgetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return budget_service.set_budget(db, budget_in, current_user.id)

@router.get("/")
def get_budget(month: int = None, year: int = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not month or not year:
        today = date.today()
        month = today.month
        year = today.year
    return budget_service.get_budget(db, month, year, current_user.id)
