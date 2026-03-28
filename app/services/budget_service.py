from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional
from datetime import date
from decimal import Decimal
from sqlalchemy.sql import func
from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate

class BudgetService:
    def set_budget(self, db: Session, budget_in: BudgetCreate, user_id: int) -> Budget:
        # Check if exists
        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == budget_in.month,
            Budget.year == budget_in.year
        ).first()
        
        if budget:
            budget.total_budget = budget_in.total_budget
        else:
            budget = Budget(**budget_in.dict(), user_id=user_id)
            db.add(budget)
            
        db.commit()
        db.refresh(budget)
        return budget

    def get_budget(self, db: Session, month: int, year: int, user_id: int) -> dict:
        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year
        ).first()

        total_budget = budget.total_budget if budget else Decimal('0.00')

        # calculate spending
        # We need start and end dates of the month to filter expenses natively but we can extract month/year natively in DB or python side.
        # Since SQLite/MySQL differ on Extract, we'll do python side start/end dates for the month
        if month == 12:
            next_month = 1
            next_year = year + 1
        else:
            next_month = month + 1
            next_year = year
            
        start_date = date(year, month, 1)
        end_date = date(next_year, next_month, 1) # Note: Less than end_date

        total_spent = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_date,
            Expense.expense_date < end_date
        ).scalar() or Decimal('0.00')

        return {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining_budget": total_budget - total_spent,
            "month": month,
            "year": year
        }

budget_service = BudgetService()
