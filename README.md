# Finance Tracker

A mobile application for keeping track of your personal finances. It automatically parses your bank and UPI SMS messages to extract and categorize income and expenses, helping you understand where your money goes.

## Tech Stack
* Python / FastAPI
* SQLite / SQLAlchemy
* React Native / Expo
* TypeScript

## Features
* Automatic SMS parsing for expenses and bank balances
* Multi-select transaction editing and deletion
* Auto-categorizes common payments and person-to-person transfers
* Category overrides that remember your preferences for specific merchants
* Visual monthly reports and analytics
* Accepts voice input for adding expenses

## Setup / Running Locally

1. Clone the repository
   ```bash
   git clone https://github.com/hiyach28/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. Run the backend
   ```bash
   python -m venv venv
   source venv/Scripts/activate # or venv/bin/activate on Mac/Linux
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
   ```

3. Run the mobile app
   ```bash
   cd mobile
   npm install
   npx expo start --dev-client
   ```

4. Build the APK (Android)
   ```bash
   cd mobile
   eas build -p android --profile development
   ```

## Future Improvements
* Add support for multiple bank accounts
* Better handling for split bills
* Export to CSV/PDF
* Better ML integration to parse SMS messages and categorize them better


