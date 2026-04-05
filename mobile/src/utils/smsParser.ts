export interface ParsedSMS {
  amount: number;
  description: string;
  type: 'expense' | 'income' | 'balance_snapshot';
  bank: string;
  account: string;
  source: string;
  date: Date;
  rawText: string;
  id: string; // the SMS id
  balance?: number;
  inferred?: boolean;
}

export const parseUPI_SMS = (messageBody: string, dateMs: number, _id: string): ParsedSMS | null => {
  const body = messageBody.toLowerCase();
  
  // Reject OTP and Spam
  if (
    body.includes('otp') || 
    body.includes('code') || 
    body.includes('verification') || 
    body.includes('offer ') || 
    body.includes('promotional') || 
    body.includes('free ')
  ) {
    return null;
  }

  // Strict keyword filtering
  const validKeywords = ['debited', 'credited', 'upi', 'paid', 'received', 'txn', 'deposited', 'added'];
  const hasKeyword = validKeywords.some(kw => body.includes(kw));
  if (!hasKeyword) return null;

  const isDebit = body.includes('debited') || body.includes('paid ') || body.includes('sent ');
  const isCredit = body.includes('credited') || body.includes('received ') || body.includes('added') || body.includes('deposited');

  let type: 'expense' | 'income' | 'balance_snapshot' = 'balance_snapshot';
  if (isCredit && !isDebit) type = 'income';
  else if (isDebit) type = 'expense';

  const balanceMatch = messageBody.match(/(?:bal|balance|avl bal|available)[\s=:-]*(?:rs[\.\s]*|inr[\.\s]*|₹)?\s?(\d+(?:,\d+)*(?:\.\d+)?)/i);
  let parsedBalance: number | undefined = undefined;
  if (balanceMatch && balanceMatch[1]) {
    parsedBalance = Math.abs(parseFloat(balanceMatch[1].replace(/,/g, '')));
  }

  let amount = 0;
  if (type !== 'balance_snapshot') {
    const amountMatch = messageBody.match(/(?:₹|rs[\.\s]*|inr[\.\s]*)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (!amountMatch || !amountMatch[1]) {
      if (!parsedBalance) return null;
      type = 'balance_snapshot';
    } else {
      const rawAmount = amountMatch[1].replace(/,/g, '');
      amount = Math.abs(parseFloat(rawAmount));
      if (isNaN(amount) || amount <= 0) {
        if (!parsedBalance) return null;
        type = 'balance_snapshot';
        amount = 0;
      }
    }
  } else {
    if (!parsedBalance) return null;
  }

  // Extract merchant / description
  let description = '';
  const toMatch = messageBody.match(/(?:to|paid to|sent to)\s+([A-Za-z0-9\s@\.\-]+?)(?:\s+(?:on|ref|upi|for|via|$))/i);
  const byMatch = messageBody.match(/(?:by|from)\s+([A-Za-z0-9\s@\.\-]+?)(?:\s+(?:on|ref|upi|for|via|$))/i);
  const vpaMatch = messageBody.match(/VPA\s+([A-Za-z0-9\.\-@]+)/i);

  if (type === 'expense' && toMatch?.[1]) description = toMatch[1].trim();
  else if (type === 'income' && byMatch?.[1]) description = byMatch[1].trim();
  else if (vpaMatch?.[1]) description = vpaMatch[1].trim();

  // Cleanup Description (handles zommato@upi splitting)
  description = description.replace(/^[Vv]pa /, '').trim();
  if (description.includes('@')) {
    description = description.split('@')[0]; // Extract just the prefix
  }
  if (description.length <= 1) {
    description = ''; // Leave temporarily blank to fall through gracefully
  } else if (type === 'expense') {
    // P2P Person Heuristic (Task 17)
    const brandKeywords = ['amazon', 'swiggy', 'zomato', 'uber', 'ola ', 'ola', 'flipkart', 'blinkit', 'zepto', 'paytm', 'phonepe', 'gpay', 'merchant', 'store', 'mart', 'shop'];
    const descLower = description.toLowerCase();
    const hasBrand = brandKeywords.some(b => descLower.includes(b));
    const wordsCount = description.trim().split(/\s+/).length;
    const hasNumbers = /\d/.test(description);

    if (!hasBrand && !hasNumbers && wordsCount > 0 && wordsCount <= 3 && !description.toLowerCase().startsWith('paid to')) {
      description = `Paid to ${description.charAt(0).toUpperCase() + description.slice(1)}`;
    }
  }

  // Bank and Account Fallbacks
  const bankMatch = messageBody.match(/(?:from|credited to|in)\s+([A-Za-z]+)\s*(?:bank|a\/c|account)/i);
  const bank = bankMatch?.[1]?.trim() || 'Equitas Transaction';

  const accountMatch = messageBody.match(/(?:a\/c no\.?|ac no\.?|account no\.?|a\/c)\s*x{0,6}(\d{3,6})/i);
  const account = accountMatch?.[1]?.trim() || '';

  // Task 22: Intelligent Unknowns Labeling
  if (!description || description.length <= 1) {
    if (bankMatch?.[1]) {
       const bankName = bankMatch[1].trim();
       description = `${bankName.charAt(0).toUpperCase() + bankName.slice(1).toLowerCase()} Transaction`;
    } else {
       description = 'General Expense';
    }
  }

  return {
    amount,
    description,
    type,
    bank,
    account,
    source: 'sms_import',
    date: new Date(dateMs),
    rawText: messageBody,
    id: _id.toString(),
    balance: parsedBalance
  };
};
