# Database Schema

## Project: Personal Finance Tracker  
Database: MySQL 8  
Engine: InnoDB  
Charset: utf8mb4

---

# Tables Overview

The system consists of the following core tables:

- users
- wallets
- categories
- subcategories
- expenses
- wallet_transactions
- wallet_transfers
budgets
habit_insights

---

# 1. users

Stores application users.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

# 2. wallets

Stores user wallets.

```sql
CREATE TABLE wallets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
``` 

# 3. categories

Stores expense categories.

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE subcategories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,

    FOREIGN KEY (category_id) REFERENCES categories(id)
);
``` 

# 4. expenses

Stores user expenses.

```sql
CREATE TABLE expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    wallet_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    subcategory_id BIGINT UNSIGNED NOT NULL,    
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    expense_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);
``` 

# 5. budgets

Stores user budgets.

```sql
CREATE TABLE budgets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    total_budget DECIMAL(12,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
``` 

# 7. wallet transfers

Stores user wallet transfers.

```sql
CREATE TABLE wallet_transfers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    from_wallet_id BIGINT UNSIGNED NOT NULL,
    to_wallet_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transfer_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (from_wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (to_wallet_id) REFERENCES wallets(id)
);
```

# 6. wallet transactions

Stores user wallet transactions.

```sql
CREATE TABLE wallet_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('income','expense','transfer') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

# habit insights

Stores user habit insights.

```sql
CREATE TABLE habit_insights (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED,
    habit_name VARCHAR(100),
    frequency INT,
    total_spent DECIMAL(12,2),
    month INT,
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```     

```sql
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_wallet ON expenses(wallet_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

CREATE INDEX idx_wallet_user ON wallets(user_id);
CREATE INDEX idx_budget_user ON budgets(user_id);

```



Index Recommendations

For performance optimization, indexes should be added to commonly queried fields:
 - expenses(user_id)
 - expenses(wallet_id)
 - expenses(category_id)
 - budgets(user_id)
 - wallet_transfers(user_id)