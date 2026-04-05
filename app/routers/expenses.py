from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services.expense_service import expense_service
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.create_expense(db, expense_in, current_user.id)

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = Query(None),
    subcategory_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return expense_service.get_expenses(
        db, current_user.id, skip=skip, limit=limit, 
        category_id=category_id, subcategory_id=subcategory_id,
        start_date=start_date, end_date=end_date
    )

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.get_expense(db, expense_id, current_user.id)

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.update_expense(db, expense_id, expense_in, current_user.id)

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense_service.delete_expense(db, expense_id, current_user.id)
    return {"detail": "Expense deleted"}
