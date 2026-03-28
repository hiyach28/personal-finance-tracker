from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date

class ExpenseBase(BaseModel):
    wallet_id: int
    category_id: int
    subcategory_id: int
    amount: Decimal
    description: Optional[str] = None
    expense_date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
