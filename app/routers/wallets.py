from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.schemas.wallet import WalletCreate, WalletResponse, AddMoneyRequest, TransferMoneyRequest, WalletTransactionResponse
from app.services.wallet_service import wallet_service
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/wallets", tags=["wallets"])

@router.post("/", response_model=WalletResponse)
def create_wallet(wallet_in: WalletCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.create_wallet(db, wallet_in, current_user.id)

@router.get("/", response_model=List[WalletResponse])
def get_wallets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.get_wallets(db, current_user.id)

@router.get("/transactions/all", response_model=List[WalletTransactionResponse])
def get_all_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.get_all_transactions(db, current_user.id)

@router.put("/transactions/{transaction_id}", response_model=WalletTransactionResponse)
def update_transaction(transaction_id: int, req: AddMoneyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.update_transaction(db, transaction_id, req, current_user.id)

@router.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallet_service.delete_transaction(db, transaction_id, current_user.id)
    return {"detail": "Transaction deleted"}

@router.get("/{wallet_id}", response_model=WalletResponse)
def get_wallet(wallet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.get_wallet(db, wallet_id, current_user.id)

@router.put("/{wallet_id}", response_model=WalletResponse)
def update_wallet(wallet_id: int, wallet_in: WalletCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.update_wallet(db, wallet_id, wallet_in, current_user.id)

@router.delete("/{wallet_id}")
def delete_wallet(wallet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallet_service.delete_wallet(db, wallet_id, current_user.id)
    return {"detail": "Wallet deleted"}

@router.post("/{wallet_id}/add-money", response_model=WalletResponse)
def add_money(wallet_id: int, req: AddMoneyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.add_money(db, wallet_id, req, current_user.id)

@router.post("/{wallet_id}/transfer", response_model=WalletResponse)
def transfer_money(wallet_id: int, req: TransferMoneyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return wallet_service.transfer_money(db, wallet_id, req, current_user.id)
