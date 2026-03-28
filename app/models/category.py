from sqlalchemy import Column, BigInteger, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    
    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    category_id = Column(BigInteger, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    
    category = relationship("Category", back_populates="subcategories")
