from app.database.database import SessionLocal
from app.models.category import Category, Subcategory
from app.models.expense import Expense

db = SessionLocal()

# Find the category
cat = db.query(Category).filter(Category.name == "Housing & Rent").first()

if cat:
    # Optional: re-assign expenses to Miscellaneous or just delete them
    # For now, we will delete expenses associated with this category to prevent foreign key errors. 
    # Since we just added it, there are likely NO expenses, but safe to delete just in case.
    db.query(Expense).filter(Expense.category_id == cat.id).delete()
    
    # Delete Subcategories
    db.query(Subcategory).filter(Subcategory.category_id == cat.id).delete()
    
    # Delete Category
    db.delete(cat)
    db.commit()

print("Removed Housing & Rent Category")
db.close()
