from app.database.database import SessionLocal
from app.models.category import Category, Subcategory

db = SessionLocal()

new_cats = {
    "Housing & Rent": ["Rent", "Maintenance"],
    "Personal Transfers": ["Paid to Friend", "Received from Friend", "Family"]
}

for cname, subs in new_cats.items():
    cat = db.query(Category).filter(Category.name == cname).first()
    if not cat:
        cat = Category(name=cname)
        db.add(cat)
        db.commit()
        db.refresh(cat)
    
    for sub in subs:
        if not db.query(Subcategory).filter(Subcategory.name == sub, Subcategory.category_id == cat.id).first():
            db.add(Subcategory(name=sub, category_id=cat.id))
    db.commit()

misc = db.query(Category).filter(Category.name == "Miscellaneous").first()
if misc:
    for sub in ["Transaction", "General Expense"]:
        if not db.query(Subcategory).filter(Subcategory.name == sub, Subcategory.category_id == misc.id).first():
            db.add(Subcategory(name=sub, category_id=misc.id))
    db.commit()

print("Cat Seeding Complete")
db.close()
