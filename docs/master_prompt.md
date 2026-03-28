# MASTER PROMPT
Project: Personal Finance Tracker

You are a senior full-stack engineer responsible for implementing a complete system for the Personal Finance Tracker application.

The repository already contains documentation describing the system.

You MUST read the documentation before writing any code.

The documentation files are located in the **docs folder**.

---

# Step 1 — Read Documentation

Before generating any code, carefully read the following files:

docs/FRD.md  
docs/DATABASE_SCHEMA.md  
docs/DEVELOPMENT_GUIDELINES.md  
docs/MOBILE_DEVELOPMENT_GUIDELINES.md  

These documents define the **source of truth** for:

- system features
- database structure
- architecture
- development rules
- mobile UI structure

Do NOT invent new features not defined in these documents.

---

# Project Goal

Build a **mobile expense tracking application** with a backend API.

The system helps users:

- track expenses
- manage multiple wallets
- categorize spending using categories and subcategories
- define a monthly total budget
- analyze spending habits
- visualize analytics through dashboards

---

# System Architecture

The system consists of two components.

Backend

- Python
- FastAPI
- MySQL 8
- SQLAlchemy
- Alembic migrations

Mobile Application

- React Native
- TypeScript
- React Navigation
- Zustand or Redux for state management
- Axios for API communication
- Expo build system capable of generating an APK

---

# Backend Requirements

Follow clean layered architecture.

Structure:

app/
    routers/
    services/
    models/
    schemas/
    core/
    database/

Responsibilities

Routers  
Handle HTTP requests and responses.

Services  
Contain business logic.

Models  
Define SQLAlchemy models corresponding to database tables.

Schemas  
Define request and response validation.

Core  
Authentication and configuration.

---

# Database Rules

Use the schema defined in:

docs/DATABASE_SCHEMA.md

Tables include:

- users
- wallets
- categories
- subcategories
- expenses
- wallet_transactions
- wallet_transfers
- budgets
- habit_insights

Follow the relationships defined in the schema.

Do not modify the schema unless necessary for implementation.

---

# Backend Features

Implement APIs supporting the following modules.

Expense Tracking

Users must be able to:

- add expense
- edit expense
- delete expense
- view expense history
- filter by category
- filter by subcategory
- filter by date range

Wallet System

Users must be able to:

- create wallets
- edit wallets
- delete wallets
- add money to wallets
- transfer money between wallets
- view wallet balances

Budget System

Users must be able to:

- define a monthly total budget
- track monthly spending
- view remaining budget

Habit Spending Insights

The system must analyze recurring spending patterns.

Examples:

- frequent coffee purchases
- frequent snack spending
- delivery spending

Analytics Dashboard

The system must generate analytics data for:

- category spending breakdown
- subcategory breakdown
- monthly spending trend
- wallet distribution
- habit spending insights
- total wallet balance
- budget vs spending

---

# Mobile Application Requirements

The mobile app must be implemented using **React Native**.

Prefer using **Expo** so the application can easily generate an Android APK.

Follow the rules defined in:

docs/MOBILE_DEVELOPMENT_GUIDELINES.md

---

# Mobile App Screens

The application must include the following screens.

Dashboard

Displays:

- total wallet balance
- current month spending
- remaining monthly budget
- category spending summary

Add Expense Screen

Fields:

- amount
- wallet
- category
- subcategory
- description
- date

Expense History Screen

- list of expenses
- filters for category and date
- edit and delete capability

Wallet Screen

- list wallets
- add wallet
- add money to wallet
- wallet transaction history

Budget Screen

- set monthly budget
- view budget progress

Analytics Screen

- spending charts
- category breakdown
- habit insights

---

# Category System

Categories and subcategories must match those defined in the FRD.

Example:

Food & Dining

- Coffee
- Chips / Chocolates / Snacks
- Meals on Campus
- Meals Ordered (Swiggy / Zomato)

Transport

- Intra-city (Auto / Cab)
- Trains / Domestic Travel

Shopping

- Clothes
- Electronics
- Miscellaneous Purchases

Entertainment

- Movies
- Games
- College events

Healthcare

- Medicines
- Doctor visits

Miscellaneous

- Other expenses

---

# API Design

Follow REST conventions.

Examples:

GET /expenses  
POST /expenses  
PUT /expenses/{id}  
DELETE /expenses/{id}

GET /wallets  
POST /wallets  
POST /wallets/add-money

GET /analytics

---

# Security Requirements

The system must include:

- password hashing
- JWT authentication
- request validation
- user ownership checks

---

# Performance Requirements

- use pagination for large queries
- optimize analytics queries
- avoid unnecessary database joins

---

# Code Quality Rules

Follow development standards from:

docs/DEVELOPMENT_GUIDELINES.md

Additional rules:

- follow PEP8 for Python
- use TypeScript for mobile app
- keep functions modular
- avoid duplicated logic

---

# Output Requirements

Generate the following components:

Backend

- FastAPI project structure
- SQLAlchemy models
- API routers
- service layer
- authentication system
- Alembic migrations

Mobile App

- React Native project
- screen components
- navigation
- API integration
- analytics charts

The mobile application must be able to build into an **Android APK**.

---

# Important Rule

The documentation inside the **docs folder is the single source of truth**.

All generated code must follow:

FRD  
DATABASE_SCHEMA  
DEVELOPMENT_GUIDELINES  
MOBILE_DEVELOPMENT_GUIDELINES