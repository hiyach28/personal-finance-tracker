export interface User {
  id: number;
  email: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export interface Expense {
  id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  subcategory_id: number;
  amount: number;
  description: string;
  expense_date: string;
}

export interface Budget {
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  month: number;
  year: number;
}
