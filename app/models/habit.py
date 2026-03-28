from sqlalchemy import Column, BigInteger, String, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.database import Base

class HabitInsight(Base):
    __tablename__ = "habit_insights"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    category_id = Column(BigInteger, ForeignKey("categories.id"))
    habit_name = Column(String(100))
    frequency = Column(Integer)
    total_spent = Column(Numeric(12, 2))
    month = Column(Integer)
    year = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
