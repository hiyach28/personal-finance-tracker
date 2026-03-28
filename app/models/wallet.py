from sqlalchemy import Column, BigInteger, String, Numeric, DateTime, ForeignKey, Enum, Date, Text
from sqlalchemy.sql import func
from app.database.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50))
    balance = Column(Numeric(12, 2), server_default="0")
    currency = Column(String(10), server_default="INR")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    wallet_id = Column(BigInteger, ForeignKey("wallets.id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    type = Column(Enum("income", "expense", "transfer", name="wallet_tx_type"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(Text)
    transaction_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WalletTransfer(Base):
    __tablename__ = "wallet_transfers"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    from_wallet_id = Column(BigInteger, ForeignKey("wallets.id"), nullable=False)
    to_wallet_id = Column(BigInteger, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    transfer_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
