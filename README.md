<<<<<<< HEAD
# personal-finance-tracker
helps users track expenses, categorize spending, and analyze financial patterns
=======
# Personal Finance Tracker

A full-stack mobile application for managing personal finances with deep voice integration and dark mode support.

## Project Structure
- `app/`: FastAPI backend (Python).
- `mobile/`: Expo/React Native frontend (TypeScript).
- `alembic/`: Database migration scripts.

---

## 🚀 Getting Started

### 1. Backend Setup
**Prerequisites**: Python 3.10+, SQLite (default), `ffmpeg` (required for voice processing).

1.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run Migrations**:
    ```bash
    alembic upgrade head
    ```
3.  **Start API Server**:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
    ```
    *Note: Using `--host 0.0.0.0` is essential for mobile device connectivity.*

### 2. Voice Input Setup
The application uses **Google Speech Recognition** (via `SpeechRecognition` library) and `pydub`.
- **FFmpeg**: You MUST have `ffmpeg` installed and accessible in your system PATH for the backend to handle audio files.

### 3. Mobile Setup
**Prerequisites**: Node.js, Expo Go app on your phone.

1.  **Install dependencies**:
    ```bash
    cd mobile
    npm install
    ```
2.  **Configure API URL**:
    Open `mobile/src/services/api.ts` and update `BASE_URL` with your computer's local Wi-Fi IP address (e.g., `http://192.168.1.XX:8080`).
3.  **Start Expo**:
    ```bash
    npx expo start
    ```
4.  **Connect**: Scan the QR code with your phone (or press `a` for Android Emulator / `i` for iOS Simulator).

---

## ✨ Features
- **Dashboard**: High-level spending summary, balances, and budget tracking.
- **Voice Expense**: Tap the microphone, speak your expense (e.g., *"spent 500 on dinner"*), and it will auto-categorize and fill the form.
- **Dark Mode**: High-contrast, premium dark theme with a toggle on the Dashboard.
- **Analytics**: Visual charts for category-wise spending and budget trends.
- **Wallet Management**: Track multiple wallets/accounts and add funds.
>>>>>>> 03e3ea6 (Initial commit for Personal Finance Tracker)
