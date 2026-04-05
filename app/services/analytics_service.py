from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import date
from decimal import Decimal
from app.models.wallet import Wallet, WalletTransaction
from app.models.expense import Expense
from app.models.budget import Budget
from app.models.category import Category
from app.models.habit import HabitInsight

class AnalyticsService:
    def get_dashboard_summary(self, db: Session, user_id: int) -> Dict[str, Any]:
        today = date.today()
        month = today.month
        year = today.year

        # Total Wallet Balance
        total_balance = db.query(func.sum(Wallet.balance)).filter(Wallet.user_id == user_id).scalar() or Decimal('0.00')

        # Current Month Spending
        if month == 12:
            next_month = 1
            next_year = year + 1
        else:
            next_month = month + 1
            next_year = year
            
        start_date = date(year, month, 1)
        end_date = date(next_year, next_month, 1)

        total_spent = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_date,
            Expense.expense_date < end_date
        ).scalar() or Decimal('0.00')

        # Remaining Budget
        budget_record = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year
        ).first()

        total_budget = budget_record.total_budget if budget_record else Decimal('0.00')
        remaining_budget = total_budget - total_spent

        # Category spending summary (Top categories)
        spending_by_cat = db.query(Category.name, func.sum(Expense.amount).label("total"))\
            .join(Expense, Expense.category_id == Category.id)\
            .filter(
                Expense.user_id == user_id,
                Expense.expense_date >= start_date,
                Expense.expense_date < end_date
            )\
            .group_by(Category.name)\
            .order_by(func.sum(Expense.amount).desc()).all()

        category_summary = [{"category": name, "spent": total} for name, total in spending_by_cat]

        # Recent Habit Insights
        habits = db.query(HabitInsight).filter(
            HabitInsight.user_id == user_id,
            HabitInsight.month == month,
            HabitInsight.year == year
        ).order_by(HabitInsight.frequency.desc()).limit(5).all()
        
        habit_summary = [
            {"habit": h.habit_name, "frequency": h.frequency, "total_spent": h.total_spent} for h in habits
        ]

        return {
            "total_wallet_balance": total_balance,
            "current_month_spending": total_spent,
            "total_monthly_budget": total_budget,
            "remaining_monthly_budget": remaining_budget,
            "category_spending_summary": category_summary,
            "habit_insights": habit_summary
        }

    def get_monthly_report(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        report = []
        today = date.today()
        # Generate report for the last 6 months
        for i in range(6):
            y = today.year + (today.month - 1 - i) // 12
            m = (today.month - 1 - i) % 12 + 1
            
            start_date = date(y, m, 1)
            if m == 12:
                end_date = date(y + 1, 1, 1)
            else:
                end_date = date(y, m + 1, 1)
            
            total_spent = db.query(func.sum(Expense.amount)).filter(
                Expense.user_id == user_id,
                Expense.expense_date >= start_date,
                Expense.expense_date < end_date
            ).scalar() or Decimal('0.00')

            total_income = db.query(func.sum(WalletTransaction.amount)).filter(
                WalletTransaction.user_id == user_id,
                WalletTransaction.type == 'income',
                WalletTransaction.transaction_date >= start_date,
                WalletTransaction.transaction_date < end_date
            ).scalar() or Decimal('0.00')

            budget_record = db.query(Budget).filter(
                Budget.user_id == user_id,
                Budget.month == m,
                Budget.year == y
            ).first()
            
            budget = budget_record.total_budget if budget_record else None
            remaining = budget - total_spent if budget is not None else None

            month_name = date(y, m, 1).strftime("%B %Y")
            
            report.append({
                "month": month_name,
                "spent": total_spent,
                "income": total_income,
                "budget": budget,
                "remaining": remaining
            })
            
        return report

analytics_service = AnalyticsService()
