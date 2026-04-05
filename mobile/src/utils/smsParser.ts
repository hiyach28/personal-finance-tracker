export interface ParsedSMS {
  amount: number;
  merchant: string;
  type: 'expense' | 'income';
  date: Date;
  rawText: string;
  id: string; // the SMS id
}

export const parseUPI_SMS = (messageBody: string, dateMs: number, _id: string): ParsedSMS | null => {
  const body = messageBody.toLowerCase();
  
  // Skip obvious OTPs/promotions
  if (body.includes('otp') || body.includes('code') || body.includes('verification')) {
    return null;
  }

  const isUPI = body.includes('upi') || body.includes('vpa') || body.includes('neft') || body.includes('imps') || body.includes('rtgs') || body.includes('a/c');
  const isDebit = body.includes('debited') || body.includes('paid ') || body.includes('sent ');
  const isCredit = body.includes('credited') || body.includes('received ') || body.includes('added to');

  if (!isUPI && !(isDebit || isCredit)) {
    return null;
  }

  let type: 'expense' | 'income' = 'expense';
  if (isCredit && !isDebit) {
    type = 'income';
  } else if (isDebit) {
    type = 'expense';
  } else {
    // Cannot determine safely
    return null;
  }

  // Extract amount: Rs., INR, Rs, ₹ followed by spaces/numbers
  const amountMatch = messageBody.match(/(?:(?:RS|INR|Rs\.?|₹)\s*)[-+]?([0-9,]*\.[0-9]+|[0-9,]+)/i);
  if (!amountMatch || !amountMatch[1]) return null;

  const rawAmount = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(rawAmount);

  if (isNaN(amount) || amount <= 0) return null;

  // Extract merchant - looking for transfer to/from or vpa
  let merchant = 'Unknown';
  const toMatch = messageBody.match(/to\s+([A-Za-z0-9\s@\.\-]+?)(?:\s+(?:on|ref|upi|for|via|$))/i);
  const byMatch = messageBody.match(/by\s+([A-Za-z0-9\s@\.\-]+?)(?:\s+(?:on|ref|upi|for|via|$))/i);
  const vpaMatch = messageBody.match(/VPA\s+([A-Za-z0-9\.\-@]+)/i);

  if (type === 'expense' && toMatch?.[1]) {
    merchant = toMatch[1].trim();
  } else if (type === 'income' && byMatch?.[1]) {
    merchant = byMatch[1].trim();
  } else if (vpaMatch?.[1]) {
    merchant = vpaMatch[1].trim();
  }

  // Optional string cleanup
  merchant = merchant.replace(/^[Vv]pa /, '').trim();
  if (merchant.length < 2 || merchant.toLowerCase() === 'vpa') {
    merchant = 'Unknown';
  }

  return {
    amount,
    merchant,
    type,
    date: new Date(dateMs),
    rawText: messageBody,
    id: _id.toString()
  };
};
