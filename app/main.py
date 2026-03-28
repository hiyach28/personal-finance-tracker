import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import engine, Base

from app.routers import auth, categories, wallets, expenses, budgets, analytics, voice_expense

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(wallets.router)
app.include_router(expenses.router)
app.include_router(budgets.router)
app.include_router(analytics.router)
app.include_router(voice_expense.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Personal Finance Tracker API"}
