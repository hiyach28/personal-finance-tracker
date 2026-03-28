# Mobile Development Guidelines

## Project: Personal Finance Tracker Mobile App

These guidelines define how the **mobile application** should be implemented based on the project FRD. The mobile app must follow these rules so that development remains structured, scalable, and consistent.

The goal is to build a **React Native mobile application that can be compiled into an Android APK**.

---

# Technology Stack

Framework
React Native (Expo preferred for faster development)

Language
TypeScript

Navigation
React Navigation

State Management
Zustand (preferred) or Redux Toolkit

API Communication
Axios

Charts / Analytics
react-native-chart-kit

Local Storage
AsyncStorage

Build System
Expo EAS Build or React Native CLI to generate APK

---

# Project Architecture

The mobile project must follow a modular folder structure.

```
src/

  components/
  screens/
  navigation/
  services/
  store/
  hooks/
  utils/
  constants/
  types/
```

### components

Reusable UI components.

Examples

* ExpenseCard
* WalletCard
* CategorySelector
* BudgetProgressBar
* AnalyticsChart

### screens

Application screens.

Examples

* DashboardScreen
* AddExpenseScreen
* ExpenseHistoryScreen
* WalletsScreen
* WalletDetailScreen
* BudgetScreen
* AnalyticsScreen

### navigation

Contains navigation configuration.

Examples

* RootNavigator
* BottomTabNavigator
* StackNavigator

### services

Handles API communication with backend.

Examples

* expenseService
* walletService
* analyticsService
* authService

### store

Global state management.

Examples

* userStore
* walletStore
* expenseStore

### hooks

Custom React hooks.

Examples

* useExpenses
* useWallets
* useBudget

---

# Navigation Design

The app must use **Bottom Tab Navigation**.

Main tabs

1. Dashboard
2. Add Expense
3. History
4. Wallets
5. Analytics

Navigation stack example

Dashboard → Expense Details
Wallets → Wallet Details
History → Edit Expense

---

# Core Screens

## Dashboard Screen

Displays overall financial status.

Must show

* Total wallet balance
* Current month spending
* Remaining monthly budget
* Category spending summary
* Quick "Add Expense" button

---

## Add Expense Screen

Used to record new expenses.

Fields

* Amount
* Wallet
* Category
* Sub‑category
* Description
* Date

UX requirement

Expense entry should take **less than 5 seconds**.

---

## Expense History Screen

Displays all recorded expenses.

Features

* List of expenses
* Filter by date
* Filter by category
* Filter by subcategory
* Edit expense
* Delete expense

Use **FlatList** for performance.

---

## Wallet Screen

Displays user wallets.

Features

* View all wallets
* Create wallet
* Add money to wallet
* View wallet transactions

Wallet card must display

* wallet name
* wallet type
* current balance

---

## Budget Screen

Displays monthly budget information.

Features

* Set total monthly budget
* View total spending
* View remaining budget
* Visual progress bar

---

## Analytics Screen

Displays spending insights.

Charts

* Category spending pie chart
* Monthly spending line chart
* Subcategory breakdown
* Habit spending insights

---

# Category System

The mobile app must implement hierarchical categories.

Example

Food & Dining

* Coffee
* Chips / Chocolates / Snacks
* Meals on Campus
* Meals Ordered (Swiggy / Zomato)

Transport

* Intra-city (Auto / Cab)
* Trains / Domestic Travel

Shopping

* Clothes
* Electronics
* Miscellaneous

Entertainment

* Movies
* Games
* College events

Healthcare

* Medicines
* Doctor visits

Miscellaneous

* Other expenses

Users must select **subcategory when adding an expense**.

---

# Wallet Money Addition

The system must support adding incoming money.

Examples

* salary received
* money from parents
* refund
* wallet transfer

When money is added

wallet balance must update automatically.

---

# API Integration

All API calls must go through the services layer.

Example structure

```
services/

  expenseService.ts
  walletService.ts
  analyticsService.ts
```

Example endpoints

GET /expenses
POST /expenses

GET /wallets
POST /wallets

POST /wallets/add-money

GET /analytics

---

# UI / UX Principles

The app should follow these design principles.

* Minimal steps to add expenses
* Clean dashboard layout
* Quick category selection
* Easy wallet switching

Recommended UI patterns

* floating "Add Expense" button
* wallet cards
* progress bars for budgets
* simple charts for analytics

---

# Performance Guidelines

* Use FlatList for large lists
* Avoid unnecessary re-renders
* Memoize heavy components
* Lazy load analytics

---

# Security Guidelines

* Never store passwords locally
* Store tokens securely
* Validate API responses

---

# APK Build Requirement

The application must support building an **Android APK**.

Preferred build process

Expo EAS Build

Commands example

```
npm install
npx expo start
npx expo build:android
```

or

```
npx expo run:android
```

The final output must produce a **downloadable APK file**.

---

# Development Best Practices

* Use functional components
* Use React hooks
* Keep components small
* Reuse UI components
* Separate UI from business logic

---

# Future Mobile Enhancements

Possible future features

* offline expense recording
* receipt scanning
* push notifications for budget alerts
* smart spending insights

---

This document defines the guidelines required for implementing the mobile application.

All implementation decisions must follow these guidelines together with the FRD and database schema.
