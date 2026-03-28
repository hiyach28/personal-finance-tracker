from sqlalchemy import Column, BigInteger, Numeric, Text, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    wallet_id = Column(BigInteger, ForeignKey("wallets.id"), nullable=False, index=True)
    category_id = Column(BigInteger, ForeignKey("categories.id"), nullable=False, index=True)
    subcategory_id = Column(BigInteger, ForeignKey("subcategories.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(Text)
    expense_date = Column(Date, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
