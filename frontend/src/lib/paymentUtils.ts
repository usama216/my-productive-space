/**
 * Payment utility functions for consistent calculations across the application
 */

/**
 * Calculate credit card fee with proper rounding to 2 decimal places
 * @param amount - The base amount to calculate 5% fee on
 * @returns The credit card fee rounded to 2 decimal places
 * 
 * Examples:
 * - 2.925 → 2.93 (round up)
 * - 2.923 → 2.92 (round down)
 * - 2.9250001 → 2.93 (round up)
 */
export function calculateCreditCardFee(amount: number): number {
  const fee = amount * 0.05
  // Round to 2 decimal places using proper rounding logic
  return Math.round(fee * 100) / 100
}

/**
 * Calculate PayNow transaction fee for amounts less than $10
 * @param amount - The base amount
 * @returns The PayNow fee (0.20 for amounts < $10, 0 otherwise)
 */
export function calculatePayNowFee(amount: number): number {
  return amount < 10 ? 0.20 : 0
}

/**
 * Calculate total amount including fees based on payment method
 * @param baseAmount - The base amount
 * @param paymentMethod - The payment method ('creditCard' or 'payNow')
 * @returns Object containing fee and total
 */
export function calculatePaymentTotal(baseAmount: number, paymentMethod: 'creditCard' | 'payNow'): {
  fee: number
  total: number
} {
  let fee = 0
  
  if (paymentMethod === 'creditCard') {
    fee = calculateCreditCardFee(baseAmount)
  } else if (paymentMethod === 'payNow') {
    fee = calculatePayNowFee(baseAmount)
  }
  
  const total = baseAmount + fee
  
  return {
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

/**
 * Format currency amount to 2 decimal places
 * @param amount - The amount to format
 * @returns Formatted amount string
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2)
}
