from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from typing import List
from datetime import date
from app.models.wallet import Wallet, WalletTransaction, WalletTransfer
from app.schemas.wallet import WalletCreate, AddMoneyRequest, TransferMoneyRequest
from app.models.user import User

class WalletService:
    def create_wallet(self, db: Session, wallet_in: WalletCreate, user_id: int) -> Wallet:
        new_wallet = Wallet(**wallet_in.dict(), user_id=user_id)
        db.add(new_wallet)
        db.commit()
        db.refresh(new_wallet)
        return new_wallet

    def get_wallets(self, db: Session, user_id: int) -> List[Wallet]:
        return db.query(Wallet).filter(Wallet.user_id == user_id).all()

    def get_all_transactions(self, db: Session, user_id: int) -> List[WalletTransaction]:
        return db.query(WalletTransaction).filter(WalletTransaction.user_id == user_id).order_by(WalletTransaction.transaction_date.desc()).all()

    def get_wallet(self, db: Session, wallet_id: int, user_id: int) -> Wallet:
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id, Wallet.user_id == user_id).first()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        return wallet

    def update_wallet(self, db: Session, wallet_id: int, wallet_in: WalletCreate, user_id: int) -> Wallet:
        wallet = self.get_wallet(db, wallet_id, user_id)
        wallet.name = wallet_in.name
        if wallet_in.type is not None:
            wallet.type = wallet_in.type
        if wallet_in.currency is not None:
            wallet.currency = wallet_in.currency
        db.commit()
        db.refresh(wallet)
        return wallet

    def delete_wallet(self, db: Session, wallet_id: int, user_id: int):
        wallet = self.get_wallet(db, wallet_id, user_id)
        db.delete(wallet)
        db.commit()

    def add_money(self, db: Session, wallet_id: int, req: AddMoneyRequest, user_id: int):
        wallet = self.get_wallet(db, wallet_id, user_id)
        
        # update balance
        wallet.balance += req.amount
        
        # create tx
        tx = WalletTransaction(
            wallet_id=wallet.id,
            user_id=user_id,
            type="income",
            amount=req.amount,
            description=req.description,
            transaction_date=date.today()
        )
        db.add(tx)
        db.commit()
        db.refresh(wallet)
        return wallet

    def update_transaction(self, db: Session, transaction_id: int, req: AddMoneyRequest, user_id: int) -> WalletTransaction:
        tx = db.query(WalletTransaction).filter(WalletTransaction.id == transaction_id, WalletTransaction.user_id == user_id).first()
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if tx.type == "income":
            delta = req.amount - tx.amount
            wallet = self.get_wallet(db, tx.wallet_id, user_id)
            wallet.balance += delta
            
        tx.amount = req.amount
        tx.description = req.description
        db.commit()
        db.refresh(tx)
        return tx

    def delete_transaction(self, db: Session, transaction_id: int, user_id: int):
        tx = db.query(WalletTransaction).filter(WalletTransaction.id == transaction_id, WalletTransaction.user_id == user_id).first()
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        if tx.type == "income":
            wallet = self.get_wallet(db, tx.wallet_id, user_id)
            wallet.balance -= tx.amount
            
        db.delete(tx)
        db.commit()

    def transfer_money(self, db: Session, from_wallet_id: int, req: TransferMoneyRequest, user_id: int):
        from_wallet = self.get_wallet(db, from_wallet_id, user_id)
        to_wallet = self.get_wallet(db, req.to_wallet_id, user_id)
        
        if from_wallet.balance < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")

        # Update balances
        from_wallet.balance -= req.amount
        to_wallet.balance += req.amount

        # Create transfer record
        transfer = WalletTransfer(
            user_id=user_id,
            from_wallet_id=from_wallet.id,
            to_wallet_id=to_wallet.id,
            amount=req.amount,
            transfer_date=date.today()
        )
        db.add(transfer)
        
        # Create transactions for history
        tx_out = WalletTransaction(
            wallet_id=from_wallet.id,
            user_id=user_id,
            type="transfer",
            amount=-req.amount, # Negative for outgoing
            description=f"Transfer to {to_wallet.name}",
            transaction_date=date.today()
        )
        tx_in = WalletTransaction(
            wallet_id=to_wallet.id,
            user_id=user_id,
            type="transfer",
            amount=req.amount,
            description=f"Transfer from {from_wallet.name}",
            transaction_date=date.today()
        )
        db.add(tx_out)
        db.add(tx_in)
        
        db.commit()
        db.refresh(from_wallet)
        return from_wallet

wallet_service = WalletService()
