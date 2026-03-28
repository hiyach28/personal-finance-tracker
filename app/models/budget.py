from sqlalchemy import Column, BigInteger, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    total_budget = Column(Numeric(12, 2), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
