from pydantic import BaseModel
from decimal import Decimal

class BudgetBase(BaseModel):
    total_budget: Decimal
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
