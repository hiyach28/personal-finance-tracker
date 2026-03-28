# Functional Requirements Document (FRD)

## Project: Personal Finance Tracker
# Tech: ReactNative

---

# 1. System Overview

The Personal Finance Tracker is a system that allows a user to manage and analyze their personal spending. The application helps users track expenses, manage multiple wallets, define spending categories and sub‑categories, monitor overall budgets, analyze spending habits, and view financial insights through an analytics dashboard.

---

# 2. Core Modules

The application consists of the following modules:

1. Expense Tracking
2. Wallet Tracking
3. Budget System
4. Habit Spending Insights
5. Analytics Dashboard

---

# 3. Expense Tracking

## Description

Allows users to record and manage daily expenses.

## Functional Requirements

Users must be able to:

* Add new expenses
* Edit existing expenses
* Delete expenses
* View expense history
* Filter expenses by date range
* Filter expenses by category
* Filter expenses by sub‑category
* Search expenses

## Expense Fields

* id
* amount
* category_id
* subcategory_id
* wallet_id
* description
* date
* created_at

Each expense must be associated with:

* a wallet
* a category
* a sub‑category

---

# 4. Categories and Sub‑Categories

## Description

Expenses must be organized using a hierarchical category system consisting of **parent categories** and **sub‑categories**.

This structure enables detailed spending analysis.

## Categories Included in the System

### 1. Food & Dining

Sub‑categories:

* Coffee
* Chips / Chocolates / Snacks
* Meals on Campus
* Meals Ordered (Swiggy / Zomato)

### 2. Transport

Sub‑categories:

* Intra‑city (Auto / Cab)
* Trains / Domestic Travel

### 3. Shopping

Sub‑categories:

* Clothes
* Electronics
* Miscellaneous Purchases

### 4. Entertainment

Sub‑categories:

* Movies
* Games
* College events

###

### 6. Healthcare

Sub‑categories:

* Medicines
* Doctor Visits

### 7. Miscellaneous

Sub‑categories:

* Other Expenses

Users should be able to:

* View all parent categories
* Select sub‑categories when recording expenses

---

# 5. Wallet Tracking

## Description

Supports multiple financial wallets representing different sources of money.

Examples:

* Cash
* Bank Account
* UPI
* Credit Card

## Functional Requirements

Users must be able to:

* Create wallet
* Edit wallet
* Delete wallet
* View wallet balance
* View wallet transaction history

### Add Money to Wallet

The system must support recording **incoming money into wallets**.

Users must be able to:

* Add money received into a wallet
* Record source of money (optional note)

Example:

* Salary received
* Money from parents
* Refund
* Wallet transfer

Wallet balance must update automatically when:

* expenses are recorded
* money is added to the wallet

## Wallet Fields

* id
* name
* type
* balance
* created_at

---

# 6. Budget System

## Description

The system allows users to define an **overall monthly budget** instead of category‑wise budgets.

## Functional Requirements

Users must be able to:

* Set a total monthly budget
* View total spending for the month
* View remaining budget
* Detect when spending exceeds the total budget

## Budget Fields

* id
* total_budget
* month
* year
* created_at

---

# 7. Habit Spending Insights

## Description

The system identifies recurring spending patterns to provide insights about frequent purchases.

Examples:

* Coffee purchases
* Snacks
* Food delivery

## Functional Requirements

The system must:

* Track frequency of repeated purchases
* Calculate total spending on habits
* Provide monthly habit summaries

Example insight:

"Coffee purchases occurred 20 times this month totaling ₹3000."

---

# 8. Analytics Dashboard

## Description

The dashboard provides financial insights through visualizations and summaries.

## Dashboard Components

* Category spending breakdown
* Sub‑category spending analysis
* Monthly spending trends
* Top spending categories
* Wallet usage distribution
* Habit spending insights
* **Total wallet balance across all wallets**
* **Total monthly spending vs total budget**

The dashboard should clearly show:

* Total money available across all wallets
* Total spending during the selected time period
* Remaining budget

---

# 9. Data Requirements

The system must manage the following entities:

* Users
* Wallets
* Categories
* Subcategories
* Expenses
* WalletTransactions (money added)
* Budgets
* HabitInsights

Each entity must include unique identifiers and timestamps.

---

# 10. Non‑Functional Requirements

## Performance

* Expense entries should be saved within one second.
* Dashboard analytics should load quickly.
* Large expense histories should support pagination.

## Security

* User authentication must be supported.
* Passwords must be securely hashed.
* Sensitive financial data must not be exposed.

## Reliability

* Wallet balances must remain consistent with recorded transactions.
* Data integrity must be maintained for all financial records.

## Usability

* Expense entry should be fast and simple.
* Categories and sub‑categories should make spending analysis intuitive.
* Dashboard insights should clearly summarize the user's financial status.

---

# 11. Future Enhancements

Possible improvements:

* Receipt image upload
* Automatic expense categorization
* Bank statement import
* AI spending insights
* Mobile application support
