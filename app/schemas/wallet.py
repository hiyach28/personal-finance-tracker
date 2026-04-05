from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date

class WalletBase(BaseModel):
    name: str
    type: Optional[str] = None
    currency: Optional[str] = "INR"

class WalletCreate(WalletBase):
    pass

class WalletResponse(WalletBase):
    id: int
    user_id: int
    balance: Decimal

    class Config:
        from_attributes = True

class WalletTransactionResponse(BaseModel):
    id: int
    wallet_id: int
    type: str
    amount: Decimal
    description: Optional[str] = None
    transaction_date: date

    class Config:
        from_attributes = True

class AddMoneyRequest(BaseModel):
    amount: Decimal
    description: Optional[str] = None

class TransferMoneyRequest(BaseModel):
    to_wallet_id: int
    amount: Decimal
