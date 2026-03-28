from pydantic import BaseModel
from typing import List

class SubcategoryBase(BaseModel):
    name: str

class SubcategoryResponse(SubcategoryBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryResponse(CategoryBase):
    id: int
    subcategories: List[SubcategoryResponse] = []

    class Config:
        from_attributes = True
