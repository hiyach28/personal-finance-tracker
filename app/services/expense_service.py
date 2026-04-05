from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional
from datetime import date
from decimal import Decimal
from app.models.expense import Expense
from app.models.wallet import Wallet, WalletTransaction
from app.models.habit import HabitInsight
from app.schemas.expense import ExpenseCreate

class ExpenseService:
    def create_expense(self, db: Session, expense_in: ExpenseCreate, user_id: int) -> Expense:
        # Check wallet
        wallet = db.query(Wallet).filter(Wallet.id == expense_in.wallet_id, Wallet.user_id == user_id).first()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        # Deduct balance
        wallet.balance -= expense_in.amount
        
        # Create expense
        expense = Expense(**expense_in.dict(), user_id=user_id)
        db.add(expense)
        
        # Create transaction log
        tx = WalletTransaction(
            wallet_id=wallet.id,
            user_id=user_id,
            type="expense",
            amount=-expense_in.amount,
            description=expense_in.description or f"Expense recorded",
            transaction_date=expense_in.expense_date
        )
        db.add(tx)
        
        # Simple Habit Tracker update logic
        habit_name = expense_in.description if expense_in.description else "General Expense"
        if habit_name:
            # check if habit matches
            month, year = expense_in.expense_date.month, expense_in.expense_date.year
            habit = db.query(HabitInsight).filter(
                HabitInsight.user_id == user_id, 
                HabitInsight.category_id == expense_in.category_id,
                HabitInsight.month == month,
                HabitInsight.year == year,
                HabitInsight.habit_name == habit_name
            ).first()
            if habit:
                habit.frequency += 1
                habit.total_spent += expense_in.amount
            else:
                new_habit = HabitInsight(
                    user_id=user_id,
                    category_id=expense_in.category_id,
                    habit_name=habit_name,
                    frequency=1,
                    total_spent=expense_in.amount,
                    month=month,
                    year=year
                )
                db.add(new_habit)

        db.commit()
        db.refresh(expense)
        return expense

    def update_expense(self, db: Session, expense_id: int, expense_in: ExpenseCreate, user_id: int) -> Expense:
        expense = self.get_expense(db, expense_id, user_id)
        
        delta = expense_in.amount - expense.amount
        
        wallet = db.query(Wallet).filter(Wallet.id == expense.wallet_id, Wallet.user_id == user_id).first()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
            
        wallet.balance -= delta
        
        expense.amount = expense_in.amount
        expense.description = expense_in.description
        expense.category_id = expense_in.category_id
        expense.subcategory_id = expense_in.subcategory_id
        expense.expense_date = expense_in.expense_date
        
        db.commit()
        db.refresh(expense)
        return expense

    def get_expenses(
        self, 
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        category_id: Optional[int] = None,
        subcategory_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Expense]:
        query = db.query(Expense).filter(Expense.user_id == user_id)
        
        if category_id:
            query = query.filter(Expense.category_id == category_id)
        if subcategory_id:
            query = query.filter(Expense.subcategory_id == subcategory_id)
        if start_date:
            query = query.filter(Expense.expense_date >= start_date)
        if end_date:
            query = query.filter(Expense.expense_date <= end_date)
            
        return query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()

    def get_expense(self, db: Session, expense_id: int, user_id: int) -> Expense:
        expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return expense
        
    def delete_expense(self, db: Session, expense_id: int, user_id: int):
        expense = self.get_expense(db, expense_id, user_id)
        
        # Refund wallet
        wallet = db.query(Wallet).filter(Wallet.id == expense.wallet_id).first()
        if wallet:
            wallet.balance += expense.amount
            
            # Create transaction log
            tx = WalletTransaction(
                wallet_id=wallet.id,
                user_id=user_id,
                type="income",
                amount=expense.amount,
                description=f"Refund from deleted expense {expense_id}",
                transaction_date=date.today()
            )
            db.add(tx)
        
        db.delete(expense)
        db.commit()

expense_service = ExpenseService()
