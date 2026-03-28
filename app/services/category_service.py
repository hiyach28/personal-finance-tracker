from sqlalchemy.orm import Session
from app.models.category import Category, Subcategory
from typing import List

class CategoryService:
    DEFAULT_CATEGORIES = {
        "Food & Dining": [
            "Coffee",
            "Chips / Chocolates / Snacks",
            "Meals on Campus",
            "Meals Ordered (Swiggy / Zomato)"
        ],
        "Travel & Transport": [
            "Intra-city (Auto / Cab)",
            "Trains / Domestic Travel"
        ],
        "Shopping": [
            "Clothes",
            "Electronics",
            "Miscellaneous Purchases"
        ],
        "Entertainment": [
            "Movies",
            "Games",
            "College events"
        ],
        "Healthcare": [
            "Medicines",
            "Doctor Visits"
        ],
        "Miscellaneous": [
            "Other Expenses"
        ]
    }

    def seed_categories(self, db: Session):
        if db.query(Category).count() > 0:
            return

        for cat_name, subcats in self.DEFAULT_CATEGORIES.items():
            category = Category(name=cat_name)
            db.add(category)
            db.commit()
            db.refresh(category)

            for subcat_name in subcats:
                subcategory = Subcategory(name=subcat_name, category_id=category.id)
                db.add(subcategory)
            db.commit()

    def get_categories(self, db: Session) -> List[Category]:
        return db.query(Category).all()

category_service = CategoryService()
